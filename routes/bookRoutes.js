const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all books
router.get('/', bookController.getAllBooks);

// Search books
router.get('/search', bookController.searchBooks);

// Pagination route
router.get('/paginated', bookController.getBooksPaginated);

// Get book by ID
router.get('/:id', bookController.getBookById);

// Create new book
// Accept fields: image (cover image), pdf (PDF file)
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),
  bookController.createBook
);

// Update book
// Accept fields: image (cover image), pdf (PDF file)
router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),
  bookController.updateBook
);

// Delete book (soft delete)
router.delete('/:id', bookController.deleteBook);

// Get cover image binary by book ID
router.get('/:id/cover-image', bookController.getCoverImageById);

// Get PDF binary by book ID
router.get('/:id/pdf', bookController.getPdfById);

module.exports = router;
