const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');

router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.get('/search', sectionController.searchSections);

module.exports = router; 