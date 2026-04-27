const SleepLog = require("../models/SleepLog");

// Create sleep log
exports.createSleepLog = async (req, res) => {
  try {
    const { startTime, endTime, duration, date, notes } = req.body;
    const userId = req.user._id;

    if (!startTime) {
      return res.status(400).json({ error: "Start time is required" });
    }

    const sleepLog = new SleepLog({
      userId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: duration || null,
      date: new Date(date || startTime),
      notes,
    });

    await sleepLog.save();
    res.status(201).json(sleepLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all sleep logs for user
exports.getSleepLogs = async (req, res) => {
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

    const total = await SleepLog.countDocuments(query);
    const sleepLogs = await SleepLog.find(query)
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({ sleepLogs, total, page: Math.floor(skip / limit) + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sleep stats for a specific date
exports.getSleepStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await SleepLog.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    });

    const totalMinutes = logs.reduce(
      (sum, log) => sum + (log.duration || 0),
      0,
    );
    const totalHours = Math.floor(totalMinutes / 60);
    const sessions = logs.length;

    res.json({ totalMinutes, totalHours, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single sleep log
exports.getSleepLog = async (req, res) => {
  try {
    const sleepLog = await SleepLog.findById(req.params.id);

    if (!sleepLog) {
      return res.status(404).json({ error: "Sleep log not found" });
    }

    if (sleepLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(sleepLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update sleep log
exports.updateSleepLog = async (req, res) => {
  try {
    const sleepLog = await SleepLog.findById(req.params.id);

    if (!sleepLog) {
      return res.status(404).json({ error: "Sleep log not found" });
    }

    if (sleepLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { startTime, endTime, duration, date, notes } = req.body;

    sleepLog.startTime = startTime ? new Date(startTime) : sleepLog.startTime;
    sleepLog.endTime = endTime ? new Date(endTime) : sleepLog.endTime;
    sleepLog.duration = duration !== undefined ? duration : sleepLog.duration;
    sleepLog.date = date ? new Date(date) : sleepLog.date;
    sleepLog.notes = notes !== undefined ? notes : sleepLog.notes;

    await sleepLog.save();
    res.json(sleepLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete sleep log
exports.deleteSleepLog = async (req, res) => {
  try {
    const sleepLog = await SleepLog.findById(req.params.id);

    if (!sleepLog) {
      return res.status(404).json({ error: "Sleep log not found" });
    }

    if (sleepLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await SleepLog.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
