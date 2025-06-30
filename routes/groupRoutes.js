const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Get all groups
router.get('/', groupController.getAllGroups);

// Get group by ID
router.get('/:id', groupController.getGroupById);

// Search groups
router.get('/search', groupController.searchGroups);

// Create new group
router.post('/', groupController.createGroup);

module.exports = router; 