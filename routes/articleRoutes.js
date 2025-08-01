const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Group articles - must come before dynamic ID route!
router.get('/sectionone', articleController.getgrouparticle);

// Search articles
router.get('/search', articleController.searchArticles);

// Get paginated articles (NEW)
router.get('/paginated', articleController.getPaginatedArticles);

// Get all articles
router.get('/', articleController.getAllArticles);

// Get article for editing
router.get('/:id/edit', articleController.getArticleForEdit);

// Get article by ID
router.get('/:id', articleController.getArticleById);

// Create new article
router.post('/', articleController.createArticle);

// Update article
router.put('/:id', articleController.updateArticle);

// Delete article
router.delete('/:id', articleController.deleteArticle);

module.exports = router;
