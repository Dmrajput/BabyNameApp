const express = require("express");
const router = express.Router();
const milestoneController = require("../controllers/milestoneController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create milestone
router.post("/", milestoneController.createMilestone);

// Get all milestones
router.get("/", milestoneController.getMilestones);

// Get milestone stats
router.get("/stats", milestoneController.getMilestoneStats);

// Get single milestone
router.get("/:id", milestoneController.getMilestone);

// Update milestone
router.put("/:id", milestoneController.updateMilestone);

// Delete milestone
router.delete("/:id", milestoneController.deleteMilestone);

module.exports = router;
