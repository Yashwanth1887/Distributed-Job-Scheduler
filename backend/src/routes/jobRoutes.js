const express = require("express");

const router = express.Router();

const { createJob, getJobs } = require("../controllers/jobController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, createJob);
router.get("/", verifyToken, getJobs);

module.exports = router;
