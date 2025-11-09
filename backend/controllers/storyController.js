const storyService = require('../services/storyService'); // Import the story service

exports.addStory = async (req, res) => {
    const userId = req.user.user_id;
    const { content, media_url, content_type } = req.body;

    // Validation
    if (!content_type || !['text', 'image', 'video'].includes(content_type)) {
        return res.status(400).json({ message: 'Invalid or missing content_type. Must be "text", "image", or "video".' });
    }
    if (content_type === 'text' && (!content || content.trim() === '')) {
        return res.status(400).json({ message: 'Text stories require content.' });
    }
    if ((content_type === 'image' || content_type === 'video') && (!media_url || media_url.trim() === '')) {
        return res.status(400).json({ message: 'Image/Video stories require a media_url.' });
    }

    try {
        const newStory = await storyService.addStory(userId, content, media_url, content_type);
        res.status(201).json({
            message: 'Story created successfully!',
            story: newStory
        });

    } catch (error) {
        console.error('Error adding story:', error);
        res.status(500).json({ message: 'Server error adding story.' });
    }
};


exports.getStoriesFeed = async (req, res) => {
    const userId = req.user.user_id;

    try {
        const stories = await storyService.getStoriesFeed(userId);
        res.status(200).json({
            message: 'Stories feed fetched successfully!',
            stories: stories
        });

    } catch (error) {
        console.error('Error fetching stories feed:', error);
        res.status(500).json({ message: 'Server error fetching stories feed.' });
    }
};


exports.getUserStories = async (req, res) => {
    const { userId } = req.params;

    try {
        // Delegate to storyService to get user-specific stories
        const stories = await storyService.getUserStories(parseInt(userId));
        res.status(200).json({
            message: `Stories for user ${userId} fetched successfully!`,
            stories: stories
        });

    } catch (error) {
        console.error(`Error fetching stories for user ${userId}:`, error);
        if (error.message === 'User not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching user stories.' });
    }
};

exports.toggleStoryLike = async (req, res) => {
    const userId = req.user.user_id;
    const { storyId } = req.params;

    try {
        const liked = await storyService.toggleStoryLike(parseInt(storyId), parseInt(userId));
        if (liked) {
            res.status(201).json({ message: 'Story liked successfully!', liked: true });
        } else {
            res.status(200).json({ message: 'Story unliked successfully.', liked: false });
        }
    } catch (error) {
        console.error('Error toggling story like:', error);
        if (error.message === 'Story not found or expired.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error toggling story like.' });
    }
};


exports.addStoryReaction = async (req, res) => {
    const userId = req.user.user_id;
    const { storyId } = req.params;
    const { reaction } = req.body;

    if (!reaction || reaction.trim() === '') {
        return res.status(400).json({ message: 'Reaction content cannot be empty.' });
    }

    try {
        const reactionData = await storyService.addOrUpdateStoryReaction(parseInt(storyId), parseInt(userId), reaction);
        // For simplicity, we'll just return 201 for both add/update now or refine service to return status
        res.status(201).json({
            message: 'Story reaction processed successfully!',
            reaction: reactionData
        });

    } catch (error) {
        console.error('Error adding/updating story reaction:', error);
        if (error.message === 'Story not found or expired.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error adding/updating story reaction.' });
    }
};

exports.getStoryReactions = async (req, res) => {
    const { storyId } = req.params;

    try {
        const reactions = await storyService.getStoryReactions(parseInt(storyId));
        res.status(200).json({
            message: 'Story reactions fetched successfully!',
            reactions: reactions
        });

    } catch (error) {
        console.error('Error fetching story reactions:', error);
        if (error.message === 'Story not found or expired.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching story reactions.' });
    }
};