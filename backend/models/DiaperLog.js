const mongoose = require("mongoose");

const diaperLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["wet", "dirty", "both"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

diaperLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("DiaperLog", diaperLogSchema);
