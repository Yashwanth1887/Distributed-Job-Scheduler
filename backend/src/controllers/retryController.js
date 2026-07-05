const db = require("../config/database");

const getRetryDelay = (retryType, retryCount, retryDelay) => {
    if (retryType === "LINEAR") {
        return retryDelay * retryCount;
    }

    if (retryType === "EXPONENTIAL") {
        return retryDelay * Math.pow(2, retryCount - 1);
    }

    return retryDelay;
};

const moveToDlq = (jobId, reason, cb) => {
    const sql = `
        INSERT INTO dead_letter_queue
        (job_id, failed_reason)
        VALUES (?, ?)
    `;

    db.query(sql, [jobId, reason], cb);
};

module.exports = {
    getRetryDelay,
    moveToDlq
};
