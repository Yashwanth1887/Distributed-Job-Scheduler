const express = require("express");

const router = express.Router();

const {
    registerWorker,
    getWorkers,
    updateHeartbeat
} = require("../controllers/workerController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, registerWorker);
router.get("/", verifyToken, getWorkers);
router.put("/heartbeat", verifyToken, updateHeartbeat);

module.exports = router;
