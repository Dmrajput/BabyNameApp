const mongoose = require("mongoose");

const vaccinationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      index: true,
    },
    vaccineName: {
      type: String,
      required: true,
      trim: true,
    },
    vaccineDate: {
      type: Date,
      default: null,
    },
    nextDueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

vaccinationLogSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("VaccinationLog", vaccinationLogSchema);
