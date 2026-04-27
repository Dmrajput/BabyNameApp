const express = require("express");
const router = express.Router();
const feedingController = require("../controllers/feedingController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create feeding log
router.post("/", feedingController.createFeedingLog);

// Get all feeding logs
router.get("/", feedingController.getFeedingLogs);

// Get feeding stats for a date
router.get("/stats", feedingController.getFeedingStats);

// Get single feeding log
router.get("/:id", feedingController.getFeedingLog);

// Update feeding log
router.put("/:id", feedingController.updateFeedingLog);

// Delete feeding log
router.delete("/:id", feedingController.deleteFeedingLog);

module.exports = router;
