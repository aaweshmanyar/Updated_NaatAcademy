const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Search categories
router.get('/search', categoryController.searchCategories);

// Create new category
router.post('/', categoryController.createCategory);

module.exports = router; 