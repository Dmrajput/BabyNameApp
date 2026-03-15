const BabyName = require("../models/BabyName");

async function getAllNames(_req, res) {
  console.log("Fetching all names");
  try {
    const names = await BabyName.find().sort({ rating: -1, name: 1 });
    return res.status(200).json(names);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch names." });
  }
}

async function getNamesByCategory(req, res) {
  try {
    console.log("Fetching names by category:", req.params.category);
    const category = req.params.category?.trim();

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    const names = await BabyName.find({
      category: new RegExp(`^${category}$`, "i"),
    }).sort({ rating: -1, name: 1 });
    return res.status(200).json(names);
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch names by category." });
  }
}

async function searchNames(req, res) {
  try {
    const query = req.query.q?.toString().trim();
    console.log("Searching names with query:", query);
    if (!query) {
      return res
        .status(400)
        .json({ message: "Query parameter q is required." });
    }

    const names = await BabyName.find({
      name: { $regex: query, $options: "i" },
    }).sort({ rating: -1, name: 1 });

    return res.status(200).json(names);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to search names." });
  }
}

async function getNameById(req, res) {
  console.log("Fetching name by ID:", req.params.id);
  try {
    const { id } = req.params;
    const name = await BabyName.findById(id);

    if (!name) {
      return res.status(404).json({ message: "Name not found." });
    }

    return res.status(200).json(name);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch name details." });
  }
}

module.exports = {
  getAllNames,
  getNamesByCategory,
  searchNames,
  getNameById,
};
