const mongoose = require("mongoose");

const babyNameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Boy", "Girl", "Unisex"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: "Unknown",
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

babyNameSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model("BabyName", babyNameSchema);
