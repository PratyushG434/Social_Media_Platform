const likeService = require('../services/likeService');

exports.toggleLike = async (req, res) => {
    const userId = req.user.user_id;
    const postId= req.params.id;
    
    try {
        const liked = await likeService.toggleLike(postId, userId);
        if (liked) {
            res.status(201).json({ message: 'Post liked successfully!', liked: true });
        } else {
            res.status(200).json({ message: 'Post unliked successfully.', liked: false });
        }
    } catch (error) {
        console.error('Error toggling like on post:', error);
        if (error.message === 'Post not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error toggling like.' });
    }
};


exports.getLikesCountForPost = async (req, res) => {
    const { postId } = req.params;
    const currentUserId = req.user ? req.user.user_id : null;

    try {
        const { likesCount, userHasLiked } = await likeService.getLikesCountForPost(postId, currentUserId);
        res.status(200).json({
            message: 'Likes count fetched successfully!',
            postId: parseInt(postId),
            likesCount: likesCount,
            userHasLiked: userHasLiked
        });
    } catch (error) {
        console.error('Error fetching likes count:', error);
        if (error.message === 'Post not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching likes count.' });
    }
};