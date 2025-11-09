const commentService = require('../services/commentService');

exports.addComment = async (req, res) => {
    const userId = req.user.user_id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        const newComment = await commentService.addComment(postId, userId, content);
        res.status(201).json({
            message: 'Comment added successfully!',
            comment: newComment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        if (error.message === 'Post not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error adding comment.' });
    }
};


exports.getCommentsForPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await commentService.getCommentsForPost(postId);
        res.status(200).json({
            message: 'Comments fetched successfully!',
            comments: comments
        });

    } catch (error) {
        console.error('Error fetching comments for post:', error);
        if (error.message === 'Post not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
};