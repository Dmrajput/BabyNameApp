const express = require("express");
const router = express.Router();
const vaccinationController = require("../controllers/vaccinationController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create vaccination log
router.post("/", vaccinationController.createVaccinationLog);

// Get all vaccination logs
router.get("/", vaccinationController.getVaccinationLogs);

// Get single vaccination log
router.get("/:id", vaccinationController.getVaccinationLog);

// Update vaccination log
router.put("/:id", vaccinationController.updateVaccinationLog);

// Delete vaccination log
router.delete("/:id", vaccinationController.deleteVaccinationLog);

module.exports = router;
