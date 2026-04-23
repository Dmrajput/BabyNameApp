const BabyName = require("../models/BabyName");

const allowedGenders = ["Boy", "Girl", "Unisex"];
const genderAliasMap = {
  boy: "Boy",
  male: "Boy",
  girl: "Girl",
  female: "Girl",
  unisex: "Unisex",
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeGender(value) {
  const normalizedValue = value?.toString().trim();

  if (!normalizedValue) {
    return "";
  }

  if (normalizedValue.toLowerCase() === "all") {
    return "All";
  }

  return genderAliasMap[normalizedValue.toLowerCase()] || normalizedValue;
}

function getGenderQueryValues(gender) {
  if (gender === "Boy") {
    return ["Boy", "boy", "Male", "male"];
  }

  if (gender === "Girl") {
    return ["Girl", "girl", "Female", "female"];
  }

  if (gender === "Unisex") {
    return ["Unisex", "unisex"];
  }

  return [gender];
}

function buildNamePayload(body) {
  const rawCountry = body.country?.toString().trim();
  const rawState = body.state?.toString().trim();

  return {
    name: body.name?.toString().trim(),
    meaning: body.meaning?.toString().trim(),
    origin: body.origin?.toString().trim(),
    gender: normalizeGender(body.gender),
    category: body.category?.toString().trim(),
    country: rawCountry || "India",
    state: rawState || "Unknown",
    rating: Number(body.rating),
  };
}

function validatePayload(payload) {
  if (
    !payload.name ||
    !payload.meaning ||
    !payload.origin ||
    !payload.gender ||
    !payload.category ||
    !payload.country ||
    !payload.state
  ) {
    return "Name, meaning, origin, gender, category, country, and state are required.";
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

function normalizeUploadRecord(record) {
  const raw = record && typeof record === "object" ? record : {};

  return {
    name: raw.name?.toString().trim(),
    meaning: raw.meaning?.toString().trim(),
    origin: raw.origin?.toString().trim(),
    gender: normalizeGender(raw.gender),
    category: raw.category?.toString().trim(),
    country: raw.country?.toString().trim() || "India",
    state: raw.state?.toString().trim() || "Unknown",
    rating: Number(raw.rating),
  };
}

function buildListQuery(query, options = {}) {
  const applyCountryFilter = options.applyCountryFilter ?? true;
  const search = query.search?.toString().trim();
  const gender = normalizeGender(query.gender);
  const letter = query.letter?.toString().trim();
  const category = query.category?.toString().trim();
  const country = query.country?.toString().trim() || "India";
  const state = query.state?.toString().trim();

  const andFilters = [];

  if (search) {
    andFilters.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { meaning: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (gender && gender !== "All" && allowedGenders.includes(gender)) {
    andFilters.push({ gender: { $in: getGenderQueryValues(gender) } });
  }

  if (letter && letter !== "All") {
    andFilters.push({
      name: { $regex: `^${escapeRegex(letter)}`, $options: "i" },
    });
  }

  if (category && category !== "All") {
    andFilters.push({
      category: new RegExp(`^${escapeRegex(category)}$`, "i"),
    });
  }

  if (applyCountryFilter) {
    if (country === "India") {
      // Backward compatibility for legacy records that do not yet have country.
      andFilters.push({
        $or: [{ country: /^India$/i }, { country: { $exists: false } }],
      });
    } else {
      andFilters.push({
        country: new RegExp(`^${escapeRegex(country)}$`, "i"),
      });
    }
  }

  if (state && state !== "All") {
    andFilters.push({ state: new RegExp(`^${escapeRegex(state)}$`, "i") });
  }

  if (andFilters.length === 0) {
    return {};
  }

  if (andFilters.length === 1) {
    return andFilters[0];
  }

  return { $and: andFilters };
}

async function getAllNames(_req, res) {
  try {
    const hasPageParams =
      _req.query.page !== undefined || _req.query.limit !== undefined;
    const shouldPaginate = _req.query.paginate === "true" || hasPageParams;
    const filter = buildListQuery(_req.query, {
      applyCountryFilter: !shouldPaginate || Boolean(_req.query.country),
    });

    if (!shouldPaginate) {
      const names = await BabyName.find(filter)
        .select("name meaning category favoriteCount")
        .sort({ favoriteCount: -1, name: 1 });
      return res.status(200).json(names);
    }

    const page = Math.max(1, Number.parseInt(_req.query.page ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(_req.query.limit ?? "100", 10) || 100),
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      BabyName.find(filter)
        .sort({ rating: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      BabyName.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      data: items,
      currentPage: page,
      totalPages,
      total,
      // Backward-compatible fields for existing admin screens.
      items,
      page,
      limit,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch names." });
  }
}

async function getNamesByCategory(req, res) {
  try {
    const category = req.params.category?.trim();
    const country = req.query.country?.toString().trim() || "India";
    const state = req.query.state?.toString().trim();

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    const filter = {
      category: new RegExp(`^${category}$`, "i"),
    };

    if (country === "India") {
      filter.$or = [{ country: /^India$/i }, { country: { $exists: false } }];
    } else {
      filter.country = new RegExp(`^${country}$`, "i");
    }

    if (state && state !== "All") {
      filter.state = new RegExp(`^${state}$`, "i");
    }

    const names = await BabyName.find(filter).sort({ rating: -1, name: 1 });

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
    const country = req.query.country?.toString().trim() || "India";
    const state = req.query.state?.toString().trim();

    if (!query) {
      return res
        .status(400)
        .json({ message: "Query parameter q is required." });
    }

    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { meaning: { $regex: query, $options: "i" } },
      ],
    };

    if (country === "India") {
      filter.$or = [{ country: /^India$/i }, { country: { $exists: false } }];
    } else {
      filter.country = new RegExp(`^${country}$`, "i");
    }

    if (state && state !== "All") {
      filter.state = new RegExp(`^${state}$`, "i");
    }

    const names = await BabyName.find(filter).sort({ rating: -1, name: 1 });

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

async function uploadNames(req, res) {
  try {
    const records = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.names)
        ? req.body.names
        : null;

    if (!records) {
      return res.status(400).json({
        message: "Provide a JSON array or { names: [] } payload.",
      });
    }

    const errors = [];
    const validRecords = [];
    const batchDuplicateKeys = new Set();

    records.forEach((record, index) => {
      const normalized = normalizeUploadRecord(record);
      const validationError = validatePayload(normalized);

      if (validationError) {
        errors.push({ index, reason: validationError, record });
        return;
      }

      const dedupeKey = `${normalized.name.toLowerCase()}::${normalized.category.toLowerCase()}`;

      if (batchDuplicateKeys.has(dedupeKey)) {
        errors.push({
          index,
          reason: "Duplicate record in payload for same name and category.",
          record,
        });
        return;
      }

      batchDuplicateKeys.add(dedupeKey);
      validRecords.push({ index, payload: normalized, dedupeKey, record });
    });

    if (validRecords.length === 0) {
      return res.status(200).json({
        successCount: 0,
        failedCount: errors.length,
        errors,
      });
    }

    const lookupKeys = Array.from(batchDuplicateKeys);
    const existing = await BabyName.aggregate([
      {
        $project: {
          _id: 0,
          key: {
            $concat: [{ $toLower: "$name" }, "::", { $toLower: "$category" }],
          },
        },
      },
      {
        $match: {
          key: { $in: lookupKeys },
        },
      },
    ]);

    const existingKeys = new Set(existing.map((item) => item.key));

    const toInsert = [];

    validRecords.forEach(({ index, payload, dedupeKey, record }) => {
      if (existingKeys.has(dedupeKey)) {
        errors.push({
          index,
          reason: "Duplicate record already exists for same name and category.",
          record,
        });
        return;
      }

      toInsert.push(payload);
      existingKeys.add(dedupeKey);
    });

    if (toInsert.length > 0) {
      await BabyName.insertMany(toInsert, { ordered: false });
    }

    return res.status(200).json({
      successCount: toInsert.length,
      failedCount: errors.length,
      errors,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to upload names JSON." });
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
  uploadNames,
};
