const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all books
router.get('/', bookController.getAllBooks);

// Search books
router.get('/search', bookController.searchBooks);


// Add this route for pagination
router.get('/paginated', bookController.getBooksPaginated);


// Get book by ID
router.get('/:id', bookController.getBookById);


// Create new book
router.post('/', upload.single('image'), bookController.createBook);

// Update book
router.put('/:id', upload.single('image'), bookController.updateBook);



// Delete book
router.delete('/:id', bookController.deleteBook);



module.exports = router; 