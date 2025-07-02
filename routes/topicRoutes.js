const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/', topicController.getAllTopics);
router.get('/:id', topicController.getTopicById);
router.get('/search', topicController.searchTopics);
router.post('/', topicController.createTopic);

module.exports = router; 