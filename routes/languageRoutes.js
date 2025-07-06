const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');

// Get all languages
router.get('/', languageController.getAllLanguages);

// Get language by ID
router.get('/:id', languageController.getLanguageById);

// Create new language
router.post('/', languageController.createLanguage);

// Update language
router.put('/:id', languageController.updateLanguage);

// Delete language
router.delete('/:id', languageController.deleteLanguage);

module.exports = router; 