const mongoose = require("mongoose");

const BabyName = require("../models/BabyName");
const BbFavorite = require("../models/Favorite");

async function addFavorite(req, res) {
  try {
    const userId = req.user?.id;
    const nameId = req.body?.nameId?.toString().trim();

    if (!nameId) {
      return res.status(400).json({ message: "nameId is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(nameId)) {
      return res.status(400).json({ message: "Invalid nameId." });
    }

    const name = await BabyName.findById(nameId).select("_id");
    if (!name) {
      return res.status(404).json({ message: "Name not found." });
    }

    const existing = await BbFavorite.findOne({ userId, nameId });
    if (existing) {
      return res.status(200).json({
        message: "Already in favorites.",
        favoriteId: existing._id,
      });
    }

    const favorite = await BbFavorite.create({ userId, nameId });
    await BabyName.updateOne({ _id: nameId }, { $inc: { favoriteCount: 1 } });

    return res.status(201).json({
      message: "Added to favorites.",
      favoriteId: favorite._id,
      nameId,
      createdAt: favorite.createdAt,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to add favorite." });
  }
}

async function removeFavorite(req, res) {
  try {
    const userId = req.user?.id;
    const nameId = req.params?.nameId?.toString().trim();

    if (!mongoose.Types.ObjectId.isValid(nameId)) {
      return res.status(400).json({ message: "Invalid nameId." });
    }

    const deleted = await BbFavorite.findOneAndDelete({ userId, nameId });

    if (deleted) {
      await BabyName.updateOne(
        { _id: nameId, favoriteCount: { $gt: 0 } },
        { $inc: { favoriteCount: -1 } },
      );
    }

    return res.status(200).json({
      message: "Removed from favorites.",
      nameId,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to remove favorite." });
  }
}

async function getFavorites(req, res) {
  try {
    const userId = req.user?.id;

    const favorites = await BbFavorite.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "nameId",
        select: "name meaning origin gender category rating favoriteCount",
      });

    const payload = favorites
      .filter((item) => item.nameId)
      .map((item) => {
        const name = item.nameId.toObject();

        return {
          ...name,
          favoriteId: item._id.toString(),
          favoriteCreatedAt: item.createdAt,
        };
      });

    return res.status(200).json(payload);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch favorites." });
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};
