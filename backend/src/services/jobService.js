const db = require("../config/database");
const { getRetryDelay, moveToDlq } = require("../controllers/retryController");

const recordExecution = (jobId, workerId, status, startedAt, finishedAt, cb) => {
    const executionTimeMs = startedAt && finishedAt ? finishedAt - startedAt : null;
    const sql = `
        INSERT INTO job_executions
        (job_id, worker_id, started_at, finished_at, execution_status, execution_time_ms)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [jobId, workerId, startedAt, finishedAt, status, executionTimeMs], cb);
};

const addLog = (executionId, message, cb) => {
    const sql = `
        INSERT INTO job_logs
        (execution_id, log_message)
        VALUES (?, ?)
    `;
    db.query(sql, [executionId, message], cb);
};

module.exports = {
    recordExecution,
    addLog
};
