const JournalEntry = require("../models/JournalEntry");

// Create journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const { title, description, imageUrl, date } = req.body;
    const userId = req.user._id;

    // Validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const journalEntry = new JournalEntry({
      userId,
      title,
      description,
      imageUrl,
      date: new Date(date || new Date()),
    });

    await journalEntry.save();
    res.status(201).json(journalEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all journal entries for user
exports.getJournalEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, skip = 0, sortBy = "createdAt" } = req.query;

    const total = await JournalEntry.countDocuments({ userId });
    const journalEntries = await JournalEntry.find({ userId })
      .sort({ [sortBy]: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ journalEntries, total, page: Math.floor(skip / limit) + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single journal entry
exports.getJournalEntry = async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    if (journalEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(journalEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update journal entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    if (journalEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, description, imageUrl, date } = req.body;

    journalEntry.title = title || journalEntry.title;
    journalEntry.description = description || journalEntry.description;
    journalEntry.imageUrl =
      imageUrl !== undefined ? imageUrl : journalEntry.imageUrl;
    journalEntry.date = date ? new Date(date) : journalEntry.date;

    await journalEntry.save();
    res.json(journalEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete journal entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    if (journalEntry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await JournalEntry.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
