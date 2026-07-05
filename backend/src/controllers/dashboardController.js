const db = require("../config/database");

const getQueueHealth = (req, res) => {
    const sql = `
        SELECT
            q.queue_id,
            q.queue_name,
            q.status,
            COUNT(j.job_id) AS total_jobs,
            SUM(CASE WHEN j.status = 'QUEUED' THEN 1 ELSE 0 END) AS queued_jobs,
            SUM(CASE WHEN j.status = 'RUNNING' THEN 1 ELSE 0 END) AS running_jobs,
            SUM(CASE WHEN j.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_jobs,
            SUM(CASE WHEN j.status = 'FAILED' THEN 1 ELSE 0 END) AS failed_jobs
        FROM queues q
        LEFT JOIN jobs j ON q.queue_id = j.queue_id
        GROUP BY q.queue_id, q.queue_name, q.status
        ORDER BY q.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

const getWorkerStatus = (req, res) => {
    const sql = `
        SELECT w.worker_id, w.worker_name, w.status, h.last_heartbeat
        FROM workers w
        LEFT JOIN worker_heartbeats h ON w.worker_id = h.worker_id
        ORDER BY w.started_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

const getJobExplorer = (req, res) => {
    const sql = `
        SELECT j.*, q.queue_name
        FROM jobs j
        JOIN queues q ON j.queue_id = q.queue_id
        ORDER BY j.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

const getExecutionLogs = (req, res) => {
    const sql = `
        SELECT e.*, j.job_name, w.worker_name
        FROM job_executions e
        JOIN jobs j ON e.job_id = j.job_id
        JOIN workers w ON e.worker_id = w.worker_id
        ORDER BY e.started_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
};

const getSystemMetrics = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM queues) AS total_queues,
            (SELECT COUNT(*) FROM workers) AS total_workers,
            (SELECT COUNT(*) FROM jobs) AS total_jobs,
            (SELECT COUNT(*) FROM jobs WHERE status = 'COMPLETED') AS completed_jobs,
            (SELECT COUNT(*) FROM jobs WHERE status = 'FAILED') AS failed_jobs,
            (SELECT COUNT(*) FROM jobs WHERE status = 'RUNNING') AS running_jobs,
            (SELECT COUNT(*) FROM dead_letter_queue) AS dead_letter_jobs
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result[0]);
    });
};

module.exports = {
    getQueueHealth,
    getWorkerStatus,
    getJobExplorer,
    getExecutionLogs,
    getSystemMetrics
};
