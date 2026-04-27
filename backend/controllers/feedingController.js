const FeedingLog = require("../models/FeedingLog");

// Create feeding log
exports.createFeedingLog = async (req, res) => {
  try {
    const { type, duration, side, volume, date, notes } = req.body;
    const userId = req.user._id;

    // Validation
    if (!type) {
      return res.status(400).json({ error: "Feeding type is required" });
    }

    const feedingLog = new FeedingLog({
      userId,
      type,
      duration,
      side,
      volume,
      date: new Date(date),
      notes,
    });

    await feedingLog.save();
    res.status(201).json(feedingLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all feeding logs for user
exports.getFeedingLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, limit = 50, skip = 0 } = req.query;

    let query = { userId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const total = await FeedingLog.countDocuments(query);
    const feedingLogs = await FeedingLog.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ feedingLogs, total, page: Math.floor(skip / limit) + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get feeding stats for a specific date
exports.getFeedingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await FeedingLog.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    });

    const count = logs.length;
    const totalDuration = logs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0,
    );
    const lastFeedingTime = logs.length > 0 ? logs[0].date : null;

    res.json({ count, totalDuration, lastFeedingTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single feeding log
exports.getFeedingLog = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findById(req.params.id);

    if (!feedingLog) {
      return res.status(404).json({ error: "Feeding log not found" });
    }

    if (feedingLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(feedingLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update feeding log
exports.updateFeedingLog = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findById(req.params.id);

    if (!feedingLog) {
      return res.status(404).json({ error: "Feeding log not found" });
    }

    if (feedingLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { type, duration, side, volume, date, notes } = req.body;

    feedingLog.type = type || feedingLog.type;
    feedingLog.duration =
      duration !== undefined ? duration : feedingLog.duration;
    feedingLog.side = side !== undefined ? side : feedingLog.side;
    feedingLog.volume = volume !== undefined ? volume : feedingLog.volume;
    feedingLog.date = date ? new Date(date) : feedingLog.date;
    feedingLog.notes = notes !== undefined ? notes : feedingLog.notes;

    await feedingLog.save();
    res.json(feedingLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete feeding log
exports.deleteFeedingLog = async (req, res) => {
  try {
    const feedingLog = await FeedingLog.findById(req.params.id);

    if (!feedingLog) {
      return res.status(404).json({ error: "Feeding log not found" });
    }

    if (feedingLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await FeedingLog.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
