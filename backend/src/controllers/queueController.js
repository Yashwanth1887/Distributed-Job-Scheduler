const db = require("../config/database");

const createQueue = (req, res) => {
    const { project_id, retry_policy_id, queue_name, priority, concurrency_limit, status } = req.body;

    if (!project_id || !retry_policy_id || !queue_name) {
        return res.status(400).json({
            message: "Project, retry policy and queue name are required"
        });
    }

    const sql = `
        INSERT INTO queues
        (project_id, retry_policy_id, queue_name, priority, concurrency_limit, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            project_id,
            retry_policy_id,
            queue_name,
            priority || 1,
            concurrency_limit || 1,
            status || "ACTIVE"
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Queue created successfully",
                queue_id: result.insertId
            });
        }
    );
};

const getQueues = (req, res) => {
    const sql = `
        SELECT *
        FROM queues
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

const pauseQueue = (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE queues
        SET status = 'PAUSED'
        WHERE queue_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Queue not found" });
        }

        res.json({ message: "Queue paused successfully" });
    });
};

const resumeQueue = (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE queues
        SET status = 'ACTIVE'
        WHERE queue_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Queue not found" });
        }

        res.json({ message: "Queue resumed successfully" });
    });
};

const getQueueStatistics = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            q.queue_name,
            COUNT(j.job_id) AS total_jobs,
            SUM(CASE WHEN j.status = 'QUEUED' THEN 1 ELSE 0 END) AS queued_jobs,
            SUM(CASE WHEN j.status = 'RUNNING' THEN 1 ELSE 0 END) AS running_jobs,
            SUM(CASE WHEN j.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_jobs,
            SUM(CASE WHEN j.status = 'FAILED' THEN 1 ELSE 0 END) AS failed_jobs
        FROM queues q
        LEFT JOIN jobs j ON q.queue_id = j.queue_id
        WHERE q.queue_id = ?
        GROUP BY q.queue_id, q.queue_name
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Queue not found" });
        }

        res.json(result[0]);
    });
};

module.exports = {
    createQueue,
    getQueues,
    pauseQueue,
    resumeQueue,
    getQueueStatistics
};
