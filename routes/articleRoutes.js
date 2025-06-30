const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Get all articles
router.get('/', articleController.getAllArticles);

// Get article by ID
router.get('/:id', articleController.getArticleById);

// Search articles
router.get('/search', articleController.searchArticles);

module.exports = router; 