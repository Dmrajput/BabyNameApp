const Country = require("../models/Country");
const BabyName = require("../models/BabyName");

function toCountryDoc(code, order) {
  return {
    code,
    label: code,
    flag: "",
    order,
  };
}

async function getCountries(_req, res) {
  try {
    const countries = await Country.find({}).sort({ order: 1, label: 1 });

    if (countries.length > 0) {
      return res.status(200).json(countries);
    }

    const distinct = await BabyName.distinct("country", {
      country: { $exists: true, $ne: "" },
    });

    const fallback = distinct
      .map((value) => value?.toString().trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((code, index) => toCountryDoc(code, index + 1));

    return res.status(200).json(fallback);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch countries." });
  }
}

async function getStatesByCountry(req, res) {
  try {
    const country = req.params.country?.toString().trim();

    if (!country) {
      return res.status(400).json({ message: "Country is required." });
    }

    const filter =
      country === "India"
        ? { $or: [{ country: /^India$/i }, { country: { $exists: false } }] }
        : { country: new RegExp(`^${country}$`, "i") };

    const distinct = await BabyName.distinct("state", {
      ...filter,
      state: { $exists: true, $ne: "" },
    });

    const states = distinct
      .map((value) => value?.toString().trim())
      .filter(Boolean)
      .filter((value) => value.toLowerCase() !== "unknown")
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json(states);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch states." });
  }
}

module.exports = {
  getCountries,
  getStatesByCountry,
};
