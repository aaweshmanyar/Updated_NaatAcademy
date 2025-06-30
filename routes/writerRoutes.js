const express = require('express');
const router = express.Router();
const writerController = require('../controllers/writerController');

// Get all writers
router.get('/', writerController.getAllWriters);

// Get writer by ID
router.get('/:id', writerController.getWriterById);

// Search writers
router.get('/search', writerController.searchWriters);

module.exports = router; 