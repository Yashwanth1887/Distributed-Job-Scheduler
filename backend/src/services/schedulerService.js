const cron = require("node-cron");
const db = require("../config/database");
const { updateJobStatus } = require("../controllers/jobController");
const { startWorker } = require("./workerRunner");

const runScheduledJobs = () => {
    const sql = `
        SELECT j.job_id
        FROM jobs j
        JOIN scheduled_jobs s ON j.job_id = s.job_id
        WHERE j.status = 'SCHEDULED'
        AND s.scheduled_time IS NOT NULL
        AND s.scheduled_time <= NOW()
    `;

    db.query(sql, (err, result) => {
        if (err || result.length === 0) {
            return;
        }

        result.forEach((row) => {
            updateJobStatus(row.job_id, "QUEUED", null, () => {});
        });
    });
};

const startScheduler = () => {
    cron.schedule("*/1 * * * *", () => {
        runScheduledJobs();
    });

    const cronSql = `
        SELECT j.job_id, s.cron_expression
        FROM jobs j
        JOIN scheduled_jobs s ON j.job_id = s.job_id
        WHERE j.status = 'SCHEDULED'
        AND s.cron_expression IS NOT NULL
    `;

    db.query(cronSql, (err, result) => {
        if (err || result.length === 0) {
            startWorker();
            return;
        }

        result.forEach((row) => {
            cron.schedule(row.cron_expression, () => {
                updateJobStatus(row.job_id, "QUEUED", null, () => {});
            });
        });

        startWorker();
    });
};

module.exports = {
    startScheduler
};
