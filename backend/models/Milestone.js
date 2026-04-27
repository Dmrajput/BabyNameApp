const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["pregnancy", "baby"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    week: {
      type: Number,
      default: null, // for pregnancy
    },
    ageWeeks: {
      type: Number,
      default: null, // for baby
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

milestoneSchema.index({ userId: 1, category: 1 });
milestoneSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model("Milestone", milestoneSchema);
