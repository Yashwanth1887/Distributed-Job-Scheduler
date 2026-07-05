const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const queueRoutes = require("./routes/queueRoutes");
const jobRoutes = require("./routes/jobRoutes");
const workerRoutes = require("./routes/workerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const retryRoutes = require("./routes/retryRoutes");
const verifyToken = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", verifyToken, projectRoutes);
app.use("/api/queues", verifyToken, queueRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/retry", retryRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.send("Distributed Job Scheduler API");
});

module.exports = app;
