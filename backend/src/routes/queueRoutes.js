const express = require("express");

const router = express.Router();

const {
    createQueue,
    getQueues,
    pauseQueue,
    resumeQueue,
    getQueueStatistics
} = require("../controllers/queueController");

router.post("/", createQueue);
router.get("/", getQueues);
router.put("/:id/pause", pauseQueue);
router.put("/:id/resume", resumeQueue);
router.get("/:id/statistics", getQueueStatistics);

module.exports = router;
