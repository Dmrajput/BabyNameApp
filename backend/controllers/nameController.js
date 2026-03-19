const BabyName = require("../models/BabyName");

const allowedGenders = ["Boy", "Girl", "Unisex"];

function buildNamePayload(body) {
  return {
    name: body.name?.toString().trim(),
    meaning: body.meaning?.toString().trim(),
    origin: body.origin?.toString().trim(),
    gender: body.gender?.toString().trim(),
    category: body.category?.toString().trim(),
    rating: Number(body.rating),
  };
}

function validatePayload(payload) {
  if (
    !payload.name ||
    !payload.meaning ||
    !payload.origin ||
    !payload.gender ||
    !payload.category
  ) {
    return "Name, meaning, origin, gender, and category are required.";
  }

  if (!allowedGenders.includes(payload.gender)) {
    return "Gender must be Boy, Girl, or Unisex.";
  }

  if (
    !Number.isFinite(payload.rating) ||
    payload.rating < 1 ||
    payload.rating > 5
  ) {
    return "Rating must be a number between 1 and 5.";
  }

  return null;
}

function buildListQuery(query) {
  const search = query.search?.toString().trim();
  const category = query.category?.toString().trim();

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (category && category !== "All") {
    filter.category = new RegExp(`^${category}$`, "i");
  }

  return filter;
}

async function getAllNames(_req, res) {
  try {
    const filter = buildListQuery(_req.query);
    const shouldPaginate = _req.query.paginate === "true";

    if (!shouldPaginate) {
      const names = await BabyName.find(filter).sort({ rating: -1, name: 1 });
      return res.status(200).json(names);
    }

    const page = Math.max(1, Number.parseInt(_req.query.page ?? "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(_req.query.limit ?? "10", 10) || 10),
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      BabyName.find(filter)
        .sort({ rating: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      BabyName.countDocuments(filter),
    ]);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch names." });
  }
}

async function getNamesByCategory(req, res) {
  try {
    const category = req.params.category?.trim();

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    const names = await BabyName.find({
      category: new RegExp(`^${category}$`, "i"),
    }).sort({ rating: -1, name: 1 });
    console.log(names);
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

async function createName(req, res) {
  try {
    const payload = buildNamePayload(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const created = await BabyName.create(payload);
    return res.status(201).json(created);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to create name." });
  }
}

async function updateName(req, res) {
  try {
    const { id } = req.params;
    const payload = buildNamePayload(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updated = await BabyName.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Name not found." });
    }

    return res.status(200).json(updated);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to update name." });
  }
}

async function deleteName(req, res) {
  try {
    const { id } = req.params;
    const deleted = await BabyName.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Name not found." });
    }

    return res.status(200).json({ message: "Name deleted successfully.", id });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete name." });
  }
}

module.exports = {
  getAllNames,
  getNamesByCategory,
  searchNames,
  getNameById,
  createName,
  updateName,
  deleteName,
};
