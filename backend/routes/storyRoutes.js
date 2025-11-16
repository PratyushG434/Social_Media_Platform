const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


// protected routes
router.post('/', protect, upload.single('content'), storyController.addStory);
router.get('/feed', protect, storyController.getStoriesFeed);

router.post('/:storyId/likes', protect, storyController.toggleStoryLike);
router.post('/:storyId/reactions', protect, storyController.addStoryReaction);


// public routes
router.get('/user/:userId', storyController.getUserStories);
router.get('/:storyId/reactions', storyController.getStoryReactions);
router.get('/:storyId/getLikes', storyController.getStoryLikes);


module.exports = router;