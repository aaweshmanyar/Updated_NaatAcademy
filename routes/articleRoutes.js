const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Get all articles
router.get('/', articleController.getAllArticles);

// Get article by ID
router.get('/:id', articleController.getArticleById);

// Get article for editing
router.get('/:id/edit', articleController.getArticleForEdit);

// Search articles
router.get('/search', articleController.searchArticles);

// Create new article
router.post('/', articleController.createArticle);

// Update article
router.put('/:id', articleController.updateArticle);

// Delete article
router.delete('/:id', articleController.deleteArticle);

module.exports = router; 