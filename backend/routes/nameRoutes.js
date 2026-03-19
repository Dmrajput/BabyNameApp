const express = require("express");

const {
  getAllNames,
  createName,
  deleteName,
  getNamesByCategory,
  searchNames,
  updateName,
  getNameById,
} = require("../controllers/nameController");
const { requireAdminEmail } = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", getAllNames);
router.post("/", requireAdminEmail, createName);
router.get("/category/:category", getNamesByCategory);
router.get("/search", searchNames);
router.get("/:id", getNameById);
router.put("/:id", requireAdminEmail, updateName);
router.delete("/:id", requireAdminEmail, deleteName);

module.exports = router;
