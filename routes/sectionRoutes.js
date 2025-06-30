const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');

// Get all sections
router.get('/', sectionController.getAllSections);

// Get section by ID
router.get('/:id', sectionController.getSectionById);

// Search sections
router.get('/search', sectionController.searchSections);

// Create new section
router.post('/', sectionController.createSection);

module.exports = router; 