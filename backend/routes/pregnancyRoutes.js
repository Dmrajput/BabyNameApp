const express = require("express");
const router = express.Router();
const pregnancyController = require("../controllers/pregnancyController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create pregnancy data
router.post("/", pregnancyController.createPregnancyData);

// Get pregnancy data for current user
router.get("/", pregnancyController.getPregnancyData);

// Update pregnancy data
router.put("/", pregnancyController.updatePregnancyData);

// Delete pregnancy data
router.delete("/", pregnancyController.deletePregnancyData);

module.exports = router;
