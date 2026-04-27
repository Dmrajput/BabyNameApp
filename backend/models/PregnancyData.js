const mongoose = require("mongoose");

const pregnancyDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      unique: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    week: {
      type: Number,
      min: 0,
      max: 40,
      default: 0,
    },
    dayOfWeek: {
      type: Number,
      min: 1,
      max: 7,
      default: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model("PregnancyData", pregnancyDataSchema);
