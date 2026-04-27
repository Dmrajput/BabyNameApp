const mongoose = require("mongoose");

const feedingLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["breastfeeding", "bottle"],
      required: true,
    },
    duration: {
      type: Number, // minutes (for breastfeeding)
      default: null,
    },
    side: {
      type: String,
      enum: ["left", "right", "both", null],
      default: null,
    },
    volume: {
      type: Number, // ml (for bottle)
      default: null,
    },
    date: {
      type: Date,
      required: true,
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

feedingLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("FeedingLog", feedingLogSchema);
