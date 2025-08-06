const express = require('express');
const router = express.Router();
const kalamController = require('../controllers/Kalaamsubmission');

// Insert new kalam submission (POST)
router.post('/kalamsub', kalamController.insertKalam);

// Get all kalam submissions (GET)
router.get('/kalamssub', kalamController.getKalamSubmissions);

module.exports = router;
