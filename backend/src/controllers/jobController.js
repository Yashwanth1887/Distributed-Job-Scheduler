const db = require("../config/database");

const createJob = (req, res) => {
    const {
        queue_id,
        job_name,
        payload,
        priority,
        status,
        scheduled_time,
        cron_expression
    } = req.body;

    if (!queue_id || !job_name) {
        return res.status(400).json({
            message: "Queue and job name are required"
        });
    }

    const jobStatus = status || (scheduled_time || cron_expression ? "SCHEDULED" : "QUEUED");

    if (Array.isArray(req.body.jobs) && req.body.jobs.length > 0) {
        const jobs = req.body.jobs;
        let done = 0;
        const ids = [];

        jobs.forEach((item) => {
            const sql = `
                INSERT INTO jobs
                (queue_id, job_name, payload, status, priority)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    item.queue_id || queue_id,
                    item.job_name,
                    item.payload ? JSON.stringify(item.payload) : null,
                    item.status || "QUEUED",
                    item.priority || priority || 1
                ],
                (err, result) => {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    ids.push(result.insertId);
                    done += 1;

                    if (done === jobs.length) {
                        res.status(201).json({
                            message: "Batch jobs created successfully",
                            job_ids: ids
                        });
                    }
                }
            );
        });

        return;
    }
    const sql = `
        INSERT INTO jobs
        (queue_id, job_name, payload, status, priority)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [queue_id, job_name, payload ? JSON.stringify(payload) : null, jobStatus, priority || 1],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            const jobId = result.insertId;

            if (scheduled_time || cron_expression) {
                const scheduleSql = `
                    INSERT INTO scheduled_jobs
                    (job_id, scheduled_time, cron_expression)
                    VALUES (?, ?, ?)
                `;

                db.query(scheduleSql, [jobId, scheduled_time || null, cron_expression || null], (scheduleErr) => {
                    if (scheduleErr) {
                        return res.status(500).json(scheduleErr);
                    }

                    res.status(201).json({
                        message: "Job created successfully",
                        job_id: jobId
                    });
                });
                return;
            }

            res.status(201).json({
                message: "Job created successfully",
                job_id: jobId
            });
        }
    );
};

const getJobs = (req, res) => {
    const { queue_id, status } = req.query;
    let sql = `
        SELECT j.*, sj.scheduled_time, sj.cron_expression
        FROM jobs j
        LEFT JOIN scheduled_jobs sj ON j.job_id = sj.job_id
        WHERE 1 = 1
    `;
    const values = [];

    if (queue_id) {
        sql += " AND j.queue_id = ?";
        values.push(queue_id);
    }

    if (status) {
        sql += " AND j.status = ?";
        values.push(status);
    }

    sql += " ORDER BY j.created_at DESC";

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

const updateJobStatus = (jobId, status, workerId, cb) => {
    const sql = `
        UPDATE jobs
        SET status = ?, worker_id = ?
        WHERE job_id = ?
    `;

    db.query(sql, [status, workerId || null, jobId], cb);
};

module.exports = {
    createJob,
    getJobs,
    updateJobStatus
};
