const express = require("express");
const router = express.Router();
const sleepController = require("../controllers/sleepController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create sleep log
router.post("/", sleepController.createSleepLog);

// Get all sleep logs
router.get("/", sleepController.getSleepLogs);

// Get sleep stats for a date
router.get("/stats", sleepController.getSleepStats);

// Get single sleep log
router.get("/:id", sleepController.getSleepLog);

// Update sleep log
router.put("/:id", sleepController.updateSleepLog);

// Delete sleep log
router.delete("/:id", sleepController.deleteSleepLog);

module.exports = router;
