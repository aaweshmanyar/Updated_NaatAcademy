const express = require('express');
const router = express.Router();
const writerController = require('../controllers/writerController');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all writers
router.get('/', writerController.getAllWriters);

// Add this with your other routes
router.get('/limited', writerController.getLimitedWriters);

// Get writer by ID
router.get('/:id', writerController.getWriterById);

// Search writers
router.get('/search', writerController.searchWriters);n

// Create new writer
router.post('/', upload.single('image'), writerController.createWriter);

// Update writer
router.put('/:id', upload.single('image'), writerController.updateWriter);

// Delete writer
router.delete('/:id', writerController.deleteWriter);

module.exports = router; 