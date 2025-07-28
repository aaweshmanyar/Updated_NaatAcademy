const express = require('express');
const router = express.Router();
const kalaamController = require('../controllers/kalaamController');


// Group articles - must come before dynamic ID route!
router.get('/sectionone', kalaamController.getgroupskalaam);

// Get all kalaams
router.get('/', kalaamController.getAllKalaams);

// Get limited kalaams
router.get('/limited', kalaamController.getLimitedKalaams);

// Get kalaam by ID
router.get('/:id', kalaamController.getKalaamById);

// Search kalaams
router.get('/search', kalaamController.searchKalaams);

// Create new kalaam
router.post('/', kalaamController.createKalaam);

// Update kalaam
router.put('/:id', kalaamController.updateKalaam);

// Delete kalaam
router.delete('/:id', kalaamController.deleteKalaam);


// Get kalaams by BookID with pagination
router.get('/book/:bookId', kalaamController.getKalaamsByBookId);


module.exports = router; 