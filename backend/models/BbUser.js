const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Unknown",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    babyName: {
      type: String,
      default: null,
      trim: true,
    },
    babyDOB: {
      type: Date,
      default: null,
    },
    pregnancyStartDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model("BbUser", userSchema);
