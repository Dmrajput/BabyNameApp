const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BbUser",
      required: true,
      index: true,
    },
    nameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BabyName",
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

favoriteSchema.index({ userId: 1, nameId: 1 }, { unique: true });

module.exports = mongoose.model("bbFavorite", favoriteSchema);
