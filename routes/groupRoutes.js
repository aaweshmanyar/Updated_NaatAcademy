const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
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

// Get all groups
router.get('/', groupController.getAllGroups);

// Get group by ID
router.get('/:id', groupController.getGroupById);

// Search groups
router.get('/search', groupController.searchGroups);

// Create new group
router.post('/', upload.single('image'), groupController.createGroup);

// Update group
router.put('/:id', upload.single('image'), groupController.updateGroup);

// Delete group
router.delete('/:id', groupController.deleteGroup);

module.exports = router; 