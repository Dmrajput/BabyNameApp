const express = require("express");

const {
  getCountries,
  getStatesByCountry,
} = require("../controllers/countryController");

const router = express.Router();

router.get("/", getCountries);
router.get("/:country/states", getStatesByCountry);

module.exports = router;
