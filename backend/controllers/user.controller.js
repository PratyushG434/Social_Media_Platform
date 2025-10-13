import { getProfile, follow, unfollow } from './user.service.js';

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const userProfile = await getProfile(username);
        
        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: userProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const followUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From the authenticated user (JWT)
        const followingId = req.params.userId;

        if (followerId === followingId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }
        
        const { success, message } = await follow(followerId, followingId);

        if (!success) {
            return res.status(400).json({ success: false, message });
        }

        res.status(201).json({ success: true, message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id; // From the authenticated user (JWT)
        const followingId = req.params.userId;
        
        const { success, message } = await unfollow(followerId, followingId);

        if (!success) {
            return res.status(400).json({ success, message });
        }

        res.status(200).json({ success: true, message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};