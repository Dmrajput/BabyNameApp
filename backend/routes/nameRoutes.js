const express = require('express');

const {
  getAllNames,
  getNamesByCategory,
  searchNames,
  getNameById,
} = require('../controllers/nameController');

const router = express.Router();

router.get('/', getAllNames);
router.get('/category/:category', getNamesByCategory);
router.get('/search', searchNames);
router.get('/:id', getNameById);

module.exports = router;
