const PregnancyData = require("../models/PregnancyData");

// Create pregnancy data
exports.createPregnancyData = async (req, res) => {
  try {
    const { startDate } = req.body;
    const userId = req.user._id;

    if (!startDate) {
      return res.status(400).json({ error: "Start date is required" });
    }

    // Check if pregnancy data already exists for user
    const existingData = await PregnancyData.findOne({ userId });
    if (existingData) {
      return res
        .status(400)
        .json({ error: "Pregnancy data already exists for this user" });
    }

    // Calculate week and day
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.min(Math.floor(diffDays / 7), 40);
    const dayOfWeek = (diffDays % 7) + 1;

    const pregnancyData = new PregnancyData({
      userId,
      startDate: new Date(startDate),
      week,
      dayOfWeek,
    });

    await pregnancyData.save();
    res.status(201).json(pregnancyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pregnancy data for current user
exports.getPregnancyData = async (req, res) => {
  try {
    const userId = req.user._id;

    const pregnancyData = await PregnancyData.findOne({ userId });

    if (!pregnancyData) {
      return res.status(404).json({ error: "Pregnancy data not found" });
    }

    // Recalculate week and day
    const start = pregnancyData.startDate;
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const week = Math.min(Math.floor(diffDays / 7), 40);
    const dayOfWeek = (diffDays % 7) + 1;

    pregnancyData.week = week;
    pregnancyData.dayOfWeek = dayOfWeek;

    res.json(pregnancyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update pregnancy data
exports.updatePregnancyData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate } = req.body;

    let pregnancyData = await PregnancyData.findOne({ userId });

    if (!pregnancyData) {
      return res.status(404).json({ error: "Pregnancy data not found" });
    }

    if (startDate) {
      pregnancyData.startDate = new Date(startDate);

      // Recalculate week and day
      const start = pregnancyData.startDate;
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const week = Math.min(Math.floor(diffDays / 7), 40);
      const dayOfWeek = (diffDays % 7) + 1;

      pregnancyData.week = week;
      pregnancyData.dayOfWeek = dayOfWeek;
    }

    await pregnancyData.save();
    res.json(pregnancyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete pregnancy data
exports.deletePregnancyData = async (req, res) => {
  try {
    const userId = req.user._id;

    const pregnancyData = await PregnancyData.findOne({ userId });

    if (!pregnancyData) {
      return res.status(404).json({ error: "Pregnancy data not found" });
    }

    await PregnancyData.deleteOne({ userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
