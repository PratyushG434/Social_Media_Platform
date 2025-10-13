import { create, getFeed, like, comment } from './post.service.js';

export const createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, media_url, content_type } = req.body;
        
        const newPost = await create({ userId, content, media_url, content_type });
        
        res.status(201).json({ success: true, data: newPost });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await getFeed(userId);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        
        const { success, message } = await like(userId, postId);

        if (!success) {
            return res.status(400).json({ success: false, message });
        }
        
        res.status(201).json({ success: true, message: 'Post liked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const addComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Comment content is required' });
        }
        
        const newComment = await comment({ userId, postId, content });
        
        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};