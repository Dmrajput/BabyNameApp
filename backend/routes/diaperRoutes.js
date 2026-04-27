const express = require("express");
const router = express.Router();
const diaperController = require("../controllers/diaperController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create diaper log
router.post("/", diaperController.createDiaperLog);

// Get all diaper logs
router.get("/", diaperController.getDiaperLogs);

// Get diaper stats for a date
router.get("/stats", diaperController.getDiaperStats);

// Get single diaper log
router.get("/:id", diaperController.getDiaperLog);

// Update diaper log
router.put("/:id", diaperController.updateDiaperLog);

// Delete diaper log
router.delete("/:id", diaperController.deleteDiaperLog);

module.exports = router;
