const express = require('express');
const router = express.Router();
const mazmoonController = require('../controllers/mazmoonController');

// POST: Insert mazmoon
router.post('/mazmoon', mazmoonController.insertMazmoon);

// GET: Get all mazmoon submissions (optional)
router.get('/mazmoon', mazmoonController.getAllMazmoon);

module.exports = router;
