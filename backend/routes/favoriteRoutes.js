const express = require("express");

const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);
router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:nameId", removeFavorite);

module.exports = router;
