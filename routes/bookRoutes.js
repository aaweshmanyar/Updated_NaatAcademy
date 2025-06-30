const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Get all books
router.get('/', bookController.getAllBooks);

// Get book by ID
router.get('/:id', bookController.getBookById);

// Search books
router.get('/search', bookController.searchBooks);

// Create new book
router.post('/', bookController.createBook);

module.exports = router; 