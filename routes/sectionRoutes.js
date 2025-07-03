const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
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

// Get all sections
router.get('/', sectionController.getAllSections);

// Get section by ID
router.get('/:id', sectionController.getSectionById);

// Search sections
router.get('/search', sectionController.searchSections);

// Create new section
router.post('/', upload.single('image'), sectionController.createSection);

// Update section
router.put('/:id', upload.single('image'), sectionController.updateSection);

module.exports = router; 