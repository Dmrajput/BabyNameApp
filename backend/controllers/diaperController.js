const DiaperLog = require("../models/DiaperLog");

// Create diaper log
exports.createDiaperLog = async (req, res) => {
  try {
    const { type, date } = req.body;
    const userId = req.user._id;

    if (!type) {
      return res.status(400).json({ error: "Diaper type is required" });
    }

    const diaperLog = new DiaperLog({
      userId,
      type,
      date: new Date(date || new Date()),
    });

    await diaperLog.save();
    res.status(201).json(diaperLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all diaper logs for user
exports.getDiaperLogs = async (req, res) => {
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

    const diaperLogs = await DiaperLog.find(query)
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const wetCount = diaperLogs.filter(
      (log) => log.type === "wet" || log.type === "both",
    ).length;
    const dirtyCount = diaperLogs.filter(
      (log) => log.type === "dirty" || log.type === "both",
    ).length;
    const totalCount = diaperLogs.length;

    res.json({ diaperLogs, wetCount, dirtyCount, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get diaper stats for a specific date
exports.getDiaperStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const logs = await DiaperLog.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    });

    const wetCount = logs.filter(
      (log) => log.type === "wet" || log.type === "both",
    ).length;
    const dirtyCount = logs.filter(
      (log) => log.type === "dirty" || log.type === "both",
    ).length;
    const totalCount = logs.length;

    res.json({ wetCount, dirtyCount, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single diaper log
exports.getDiaperLog = async (req, res) => {
  try {
    const diaperLog = await DiaperLog.findById(req.params.id);

    if (!diaperLog) {
      return res.status(404).json({ error: "Diaper log not found" });
    }

    if (diaperLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(diaperLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update diaper log
exports.updateDiaperLog = async (req, res) => {
  try {
    const diaperLog = await DiaperLog.findById(req.params.id);

    if (!diaperLog) {
      return res.status(404).json({ error: "Diaper log not found" });
    }

    if (diaperLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { type, date } = req.body;

    diaperLog.type = type || diaperLog.type;
    diaperLog.date = date ? new Date(date) : diaperLog.date;

    await diaperLog.save();
    res.json(diaperLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete diaper log
exports.deleteDiaperLog = async (req, res) => {
  try {
    const diaperLog = await DiaperLog.findById(req.params.id);

    if (!diaperLog) {
      return res.status(404).json({ error: "Diaper log not found" });
    }

    if (diaperLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await DiaperLog.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
