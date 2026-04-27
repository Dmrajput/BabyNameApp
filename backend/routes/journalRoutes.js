const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { auth } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create journal entry
router.post("/", journalController.createJournalEntry);

// Get all journal entries
router.get("/", journalController.getJournalEntries);

// Get single journal entry
router.get("/:id", journalController.getJournalEntry);

// Update journal entry
router.put("/:id", journalController.updateJournalEntry);

// Delete journal entry
router.delete("/:id", journalController.deleteJournalEntry);

module.exports = router;
