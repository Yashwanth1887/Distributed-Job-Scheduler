const express = require("express");

const router = express.Router();

const {
    getQueueHealth,
    getWorkerStatus,
    getJobExplorer,
    getExecutionLogs,
    getSystemMetrics
} = require("../controllers/dashboardController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/queue-health", verifyToken, getQueueHealth);
router.get("/worker-status", verifyToken, getWorkerStatus);
router.get("/job-explorer", verifyToken, getJobExplorer);
router.get("/execution-logs", verifyToken, getExecutionLogs);
router.get("/system-metrics", verifyToken, getSystemMetrics);

module.exports = router;
