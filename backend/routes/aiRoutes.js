const express = require('express');

const { generateName } = require('../controllers/aiController');

const router = express.Router();

router.post('/generate-name', generateName);

module.exports = router;
