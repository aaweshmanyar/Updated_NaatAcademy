const express = require('express');
const router = express.Router();
const { shareKalaamController } = require('../controllers/shareController');

// Route for shared kalaam preview
router.get('/kalaam/:id', shareKalaamController);

module.exports = router;
