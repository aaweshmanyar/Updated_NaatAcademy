const express = require('express');
const router = express.Router();
const kalaamController = require('../controllers/kalaamController');

// Get all kalaams
router.get('/', kalaamController.getAllKalaams);

// Get kalaam by ID
router.get('/:id', kalaamController.getKalaamById);

// Search kalaams
router.get('/search', kalaamController.searchKalaams);

// Create new kalaam
router.post('/', kalaamController.createKalaam);

module.exports = router; 