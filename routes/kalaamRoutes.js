const express = require('express');
const router = express.Router();
const kalaamController = require('../controllers/kalaamController');

// Group articles - must come before dynamic ID route!
router.get('/sectionone', kalaamController.getgroupskalaam);

// Get all kalaams
router.get('/', kalaamController.getAllKalaams);

// Get limited kalaams
router.get('/limited', kalaamController.getLimitedKalaams);

// Search kalaams
router.get('/search', kalaamController.searchKalaams);

// Get kalaams by BookID with pagination
router.get('/book/:bookId', kalaamController.getKalaamsByBookId);

// Get Kalaams by category name with optional limit & offset
router.get('/category/:categoryName', kalaamController.getKalaamsByCategoryName);

// Get kalaam by ID - must come after other static/dynamic parameter routes
router.get('/:id', kalaamController.getKalaamById);

// Create new kalaam
router.post('/', kalaamController.createKalaam);

// Update kalaam
router.put('/:id', kalaamController.updateKalaam);

// Delete kalaam
router.delete('/:id', kalaamController.deleteKalaam);

module.exports = router;
