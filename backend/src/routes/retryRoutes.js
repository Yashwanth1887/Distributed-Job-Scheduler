const express = require("express");

const router = express.Router();

const { getRetryDelay } = require("../controllers/retryController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/delay", verifyToken, (req, res) => {
    const retryType = req.query.type || "FIXED";
    const retryCount = Number(req.query.count || 1);
    const retryDelay = Number(req.query.delay || 5);

    res.json({
        retry_type: retryType,
        delay_seconds: getRetryDelay(retryType, retryCount, retryDelay)
    });
});

module.exports = router;
