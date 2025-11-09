const followService = require('../services/followService'); // Import the follow service


exports.toggleFollow = async (req, res) => {
    const followerId = req.user.user_id;
    const { userId: followingId } = req.params;

    try {
        const followed = await followService.toggleFollow(parseInt(followerId), parseInt(followingId));
        if (followed) {
            res.status(201).json({ message: 'User followed successfully!', following: true });
        } else {
            res.status(200).json({ message: 'User unfollowed successfully.', following: false });
        }
    } catch (error) {
        console.error('Error toggling follow status:', error);
        if (error.message === 'Users cannot follow themselves.') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Target user not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error toggling follow status.' });
    }
};

exports.getFollowing = async (req, res) => {
    const { userId } = req.params;

    try {
        const following = await followService.getFollowing(parseInt(userId));
        res.status(200).json({
            message: `Users followed by user ${userId} fetched successfully!`,
            following: following
        });
    } catch (error) {
        console.error('Error fetching following list:', error);
        if (error.message === 'User not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching following list.' });
    }
};


exports.getFollowers = async (req, res) => {
    const { userId } = req.params;

    try {
        const followers = await followService.getFollowers(parseInt(userId));
        res.status(200).json({
            message: `Followers of user ${userId} fetched successfully!`,
            followers: followers
        });
    } catch (error) {
        console.error('Error fetching followers list:', error);
        if (error.message === 'User not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching followers list.' });
    }
};