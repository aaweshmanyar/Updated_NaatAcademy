const express = require('express');
const router = express.Router();
const Postcontroller = require('../controllers/Testing');



// Get all articles
router.get('/', Postcontroller.getallpost);


module.exports = router;
