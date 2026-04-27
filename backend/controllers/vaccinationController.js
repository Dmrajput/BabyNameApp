const VaccinationLog = require("../models/VaccinationLog");

// Create vaccination log
exports.createVaccinationLog = async (req, res) => {
  try {
    const { vaccineName, vaccineDate, nextDueDate, status, notes } = req.body;
    const userId = req.user._id;

    if (!vaccineName) {
      return res.status(400).json({ error: "Vaccine name is required" });
    }

    const vaccinationLog = new VaccinationLog({
      userId,
      vaccineName,
      vaccineDate: vaccineDate ? new Date(vaccineDate) : null,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      status: status || "pending",
      notes,
    });

    await vaccinationLog.save();
    res.status(201).json(vaccinationLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all vaccination logs for user
exports.getVaccinationLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 100, skip = 0 } = req.query;

    let query = { userId };

    if (status) {
      query.status = status;
    }

    const total = await VaccinationLog.countDocuments(query);
    const vaccinationLogs = await VaccinationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const pending = await VaccinationLog.countDocuments({
      userId,
      status: "pending",
    });
    const completed = await VaccinationLog.countDocuments({
      userId,
      status: "completed",
    });

    res.json({
      vaccinationLogs,
      total,
      pending,
      completed,
      page: Math.floor(skip / limit) + 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single vaccination log
exports.getVaccinationLog = async (req, res) => {
  try {
    const vaccinationLog = await VaccinationLog.findById(req.params.id);

    if (!vaccinationLog) {
      return res.status(404).json({ error: "Vaccination log not found" });
    }

    if (vaccinationLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(vaccinationLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update vaccination log
exports.updateVaccinationLog = async (req, res) => {
  try {
    const vaccinationLog = await VaccinationLog.findById(req.params.id);

    if (!vaccinationLog) {
      return res.status(404).json({ error: "Vaccination log not found" });
    }

    if (vaccinationLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { vaccineName, vaccineDate, nextDueDate, status, notes } = req.body;

    vaccinationLog.vaccineName = vaccineName || vaccinationLog.vaccineName;
    vaccinationLog.vaccineDate = vaccineDate
      ? new Date(vaccineDate)
      : vaccinationLog.vaccineDate;
    vaccinationLog.nextDueDate = nextDueDate
      ? new Date(nextDueDate)
      : vaccinationLog.nextDueDate;
    vaccinationLog.status = status || vaccinationLog.status;
    vaccinationLog.notes = notes !== undefined ? notes : vaccinationLog.notes;

    await vaccinationLog.save();
    res.json(vaccinationLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete vaccination log
exports.deleteVaccinationLog = async (req, res) => {
  try {
    const vaccinationLog = await VaccinationLog.findById(req.params.id);

    if (!vaccinationLog) {
      return res.status(404).json({ error: "Vaccination log not found" });
    }

    if (vaccinationLog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await VaccinationLog.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
