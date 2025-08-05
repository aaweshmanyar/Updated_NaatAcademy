const express = require('express');
const router = express.Router();
const kalamController = require('../controllers/Kalaamsubmission');

// POST - Submit Kalam
router.post('/', kalamController.createKalam);

// GET - Get all Kalams
router.get('/', kalamController.getAllKalam);
  
// PUT - Update a Kalam by ID
router.put('/:id', kalamController.updateKalam);

module.exports = router;
