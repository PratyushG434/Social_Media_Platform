const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');


// protected routes
router.post('/', protect, storyController.addStory);
router.get('/feed', protect, storyController.getStoriesFeed);

router.post('/:storyId/likes', protect, storyController.toggleStoryLike);
router.post('/:storyId/reactions', protect, storyController.addStoryReaction);


// public routes
router.get('/user/:userId', storyController.getUserStories);
router.get('/:storyId/reactions', storyController.getStoryReactions);

module.exports = router;