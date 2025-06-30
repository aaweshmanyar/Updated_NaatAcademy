const express = require('express');
const router = express.Router();
const kalaamController = require('../controllers/kalaamController');

router.get('/', kalaamController.getAllKalaam);
router.get('/:id', kalaamController.getKalaamById);
router.get('/search', kalaamController.searchKalaam);

module.exports = router; 