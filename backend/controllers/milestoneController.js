const Milestone = require("../models/Milestone");

// Create milestone
exports.createMilestone = async (req, res) => {
  try {
    const { category, title, week, ageWeeks, completed, notes, isCustom } =
      req.body;
    const userId = req.user._id;

    if (!category || !title) {
      return res.status(400).json({ error: "Category and title are required" });
    }

    const milestone = new Milestone({
      userId,
      category,
      title,
      week,
      ageWeeks,
      completed,
      notes,
      isCustom: isCustom || false,
    });

    await milestone.save();
    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all milestones for user
exports.getMilestones = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, completed, limit = 100, skip = 0 } = req.query;

    let query = { userId };

    if (category) {
      query.category = category;
    }

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    const total = await Milestone.countDocuments(query);
    const milestones = await Milestone.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ milestones, total, page: Math.floor(skip / limit) + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get milestone stats
exports.getMilestoneStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    let query = { userId };

    if (category) {
      query.category = category;
    }

    const total = await Milestone.countDocuments(query);
    const completed = await Milestone.countDocuments({
      ...query,
      completed: true,
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ total, completed, percentage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single milestone
exports.getMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update milestone
exports.updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      category,
      title,
      week,
      ageWeeks,
      completed,
      completedDate,
      notes,
      isCustom,
    } = req.body;

    milestone.category = category || milestone.category;
    milestone.title = title || milestone.title;
    milestone.week = week !== undefined ? week : milestone.week;
    milestone.ageWeeks = ageWeeks !== undefined ? ageWeeks : milestone.ageWeeks;
    milestone.completed =
      completed !== undefined ? completed : milestone.completed;
    milestone.completedDate = completedDate
      ? new Date(completedDate)
      : milestone.completedDate;
    milestone.notes = notes !== undefined ? notes : milestone.notes;
    milestone.isCustom = isCustom !== undefined ? isCustom : milestone.isCustom;

    await milestone.save();
    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    if (milestone.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Milestone.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
