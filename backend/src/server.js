require("dotenv").config();

const app = require("./app");
require("./config/database");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 5000;

startScheduler();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
