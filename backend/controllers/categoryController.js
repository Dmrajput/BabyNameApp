const Category = require("../models/Category");
const BabyName = require("../models/BabyName");

function toCategoryDoc(title, order) {
  return {
    id: title,
    title: `${title} Names`,
    icon: "shape",
    color: "#F1F5F9",
    order,
  };
}

async function getCategories(_req, res) {
  try {
    const country = _req.query.country?.toString().trim();

    if (country) {
      const categoryFilter =
        country === "Global"
          ? { country: /^Global$/i }
          : {
              $or: [
                { country: new RegExp(`^${country}$`, "i") },
                { country: /^Global$/i },
                { country: { $exists: false } },
              ],
            };

      const metadata = await Category.find(categoryFilter)
        .select("id title icon color order")
        .sort({ order: 1, title: 1 })
        .lean();

      const match = {
        category: { $exists: true, $ne: "" },
      };

      if (country === "India") {
        match.$or = [
          { country: /^India$/i },
          { country: /^Global$/i },
          { country: { $exists: false } },
        ];
      } else if (country === "Global") {
        match.country = /^Global$/i;
      } else {
        match.$or = [
          { country: new RegExp(`^${country}$`, "i") },
          { country: /^Global$/i },
        ];
      }

      const grouped = await BabyName.aggregate([
        { $match: match },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]);

      const categoryIdsFromNames = grouped
        .map((item) => item?._id?.toString().trim())
        .filter(Boolean);

      const metadataMap = new Map(metadata.map((item) => [item.id, item]));
      const orderedIds = [
        ...metadata.map((item) => item.id),
        ...categoryIdsFromNames.filter((id) => !metadataMap.has(id)),
      ];

      if (!orderedIds.length) {
        return res.status(200).json([]);
      }

      const merged = orderedIds.map((id, index) => {
        const meta = metadataMap.get(id);
        if (meta) {
          return meta;
        }

        return toCategoryDoc(id, index + 1);
      });

      return res.status(200).json(merged);
    }

    const categories = await Category.find({}).sort({ order: 1, title: 1 });

    if (categories.length > 0) {
      return res.status(200).json(categories);
    }

    const distinct = await BabyName.distinct("category", {
      category: { $exists: true, $ne: "" },
    });

    const fallback = distinct
      .map((value) => value?.toString().trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((title, index) => toCategoryDoc(title, index + 1));

    return res.status(200).json(fallback);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch categories." });
  }
}

module.exports = {
  getCategories,
};
