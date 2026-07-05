const db = require("../config/database");
const { recordExecution, addLog } = require("./jobService");
const { moveToDlq } = require("../controllers/retryController");

let running = false;
let timer = null;
let heartbeatTimer = null;
let workerId = null;

const setHeartbeat = () => {
    if (!workerId) {
        return;
    }

    db.query(
        "SELECT heartbeat_id FROM worker_heartbeats WHERE worker_id = ? ORDER BY heartbeat_id DESC LIMIT 1",
        [workerId],
        (err, result) => {
            if (err) {
                return;
            }

            if (result.length > 0) {
                db.query(
                    "UPDATE worker_heartbeats SET last_heartbeat = NOW() WHERE heartbeat_id = ?",
                    [result[0].heartbeat_id],
                    () => {}
                );
                return;
            }

            db.query(
                "INSERT INTO worker_heartbeats (worker_id, last_heartbeat) VALUES (?, NOW())",
                [workerId],
                () => {}
            );
        }
    );
};

const claimJob = (cb) => {
    const sql = `
        SELECT j.job_id, j.queue_id, j.retry_count, q.retry_policy_id, rp.retry_type, rp.max_retries, rp.retry_delay
        FROM jobs j
        JOIN queues q ON j.queue_id = q.queue_id
        JOIN retry_policies rp ON q.retry_policy_id = rp.retry_policy_id
        WHERE j.status IN ('QUEUED', 'FAILED')
        AND q.status = 'ACTIVE'
        ORDER BY j.priority DESC, j.created_at ASC
        LIMIT 1
        FOR UPDATE
    `;

    db.beginTransaction(() => {
        db.query(sql, (err, result) => {
            if (err || result.length === 0) {
                return db.rollback(() => cb(null));
            }

            const job = result[0];
            const nextRetry = job.retry_count + 1;

            const updateSql = `
                UPDATE jobs
                SET status = 'RUNNING', retry_count = ?
                WHERE job_id = ?
            `;

            db.query(updateSql, [nextRetry, job.job_id], (updateErr) => {
                if (updateErr) {
                    return db.rollback(() => cb(null));
                }

                db.commit(() => cb(job));
            });
        });
    });
};

const finishJob = (job, success, message) => {
    const startedAt = new Date();
    const finishedAt = new Date();
    const status = success ? "SUCCESS" : "FAILED";

    recordExecution(job.job_id, workerId, status, startedAt, finishedAt, (err, result) => {
        if (!err && result && result.insertId) {
            addLog(result.insertId, message || (success ? "Job completed" : "Job failed"), () => {});
        }
    });

    const updateSql = `
        UPDATE jobs
        SET status = ?
        WHERE job_id = ?
    `;

    db.query(updateSql, [success ? "COMPLETED" : "FAILED", job.job_id], () => {});

    if (!success) {
        const retryDelay = job.retry_type === "LINEAR" || job.retry_type === "EXPONENTIAL" || job.retry_type === "FIXED"
            ? job.retry_delay
            : 5;
        const delay = retryDelay;

        if (job.retry_count >= job.max_retries) {
            moveToDlq(job.job_id, message || "Max retries reached", () => {});
            return;
        }

        setTimeout(() => {
            db.query(
                "UPDATE jobs SET status = 'QUEUED' WHERE job_id = ?",
                [job.job_id],
                () => {}
            );
        }, delay * 1000);
    }
};

const runJob = (job) => {
    if (!job) {
        return;
    }

    const startedAt = new Date();

    recordExecution(job.job_id, workerId, "RUNNING", startedAt, null, (err, result) => {
        if (!err && result && result.insertId) {
            addLog(result.insertId, "Job started", () => {});
        }
    });

    setTimeout(() => {
        const ok = Math.random() > 0.1;
        finishJob(job, ok, ok ? "Job finished" : "Job failed");
    }, 1000);
};

const pollJobs = () => {
    if (!running) {
        return;
    }

    claimJob((job) => {
        if (job) {
            runJob(job);
        }
    });
};

const startWorker = () => {
    if (running) {
        return;
    }

    db.query(
        `
        SELECT worker_id
        FROM workers
        WHERE worker_name = 'main-worker'
        ORDER BY worker_id DESC
        LIMIT 1
        `,
        (err, result) => {
            if (!err && result.length > 0) {
                workerId = result[0].worker_id;
            } else {
                db.query(
                    "INSERT INTO workers (worker_name, status) VALUES ('main-worker', 'ACTIVE')",
                    (insertErr, insertResult) => {
                        if (!insertErr && insertResult) {
                            workerId = insertResult.insertId;
                        }
                    }
                );
            }

            running = true;
            timer = setInterval(pollJobs, 3000);
            heartbeatTimer = setInterval(setHeartbeat, 5000);
            setHeartbeat();
        }
    );
};

const stopWorker = () => {
    running = false;
    if (timer) {
        clearInterval(timer);
    }
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }
};

module.exports = {
    startWorker,
    stopWorker
};
