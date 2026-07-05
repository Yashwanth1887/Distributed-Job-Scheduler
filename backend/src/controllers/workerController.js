const db = require("../config/database");

const registerWorker = (req, res) => {
    const { worker_name } = req.body;

    if (!worker_name) {
        return res.status(400).json({ message: "Worker name is required" });
    }

    const sql = `
        INSERT INTO workers
        (worker_name, status)
        VALUES (?, 'ACTIVE')
    `;

    db.query(sql, [worker_name], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Worker registered successfully",
            worker_id: result.insertId
        });
    });
};

const getWorkers = (req, res) => {
    const sql = `
        SELECT w.*, h.last_heartbeat
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

const updateHeartbeat = (req, res) => {
    const { worker_id } = req.body;

    if (!worker_id) {
        return res.status(400).json({ message: "Worker id is required" });
    }

    const sql = `
        INSERT INTO worker_heartbeats
        (worker_id, last_heartbeat)
        VALUES (?, NOW())
        ON DUPLICATE KEY UPDATE last_heartbeat = NOW()
    `;

    db.query(sql, [worker_id], (err) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({ message: "Heartbeat updated" });
    });
};

module.exports = {
    registerWorker,
    getWorkers,
    updateHeartbeat
};
