const db = require('../db/db');


exports.toggleFollow = async (req, res) => {
    const followerId = req.user.user_id;
    const { userId: followingId } = req.params;

    const parsedFollowerId = parseInt(followerId);
    const parsedFollowingId = parseInt(followingId);

    if (parsedFollowerId === parsedFollowingId) {
        return res.status(400).json({ message: 'Users cannot follow themselves.' });
    }

    try {
        // Verify if the target user exists
        const targetUserExists = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [parsedFollowingId]);
        if (targetUserExists.rows.length === 0) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        //Check if the follower is already following target
        const existingFollow = await db.query(
            `SELECT follower_id FROM follows WHERE follower_id = $1 AND following_id = $2;`,
            [parsedFollowerId, parsedFollowingId]
        );

        if (existingFollow.rows.length > 0) {
            // If already following, UNFOLLOW
            await db.query(
                `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2;`,
                [parsedFollowerId, parsedFollowingId]
            );
            res.status(200).json({ message: 'User unfollowed successfully.', following: false });
        } else {
            // If not following, FOLLOW
            await db.query(
                `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2);`,
                [parsedFollowerId, parsedFollowingId]
            );
            res.status(201).json({ message: 'User followed successfully!', following: true });
        }

    } catch (error) {
        console.error('Error toggling follow status:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Already following this user.' });
        }
        res.status(500).json({ message: 'Server error toggling follow status.' });
    }
};


exports.getFollowing = async (req, res) => {
    const { userId } = req.params;

    try {
        const targetUserExists = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
        if (targetUserExists.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const result = await db.query(
            `SELECT
                u.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM users u
             JOIN follows f ON u.user_id = f.following_id
             WHERE f.follower_id = $1
             ORDER BY u.username ASC;`,
            [userId]
        );

        res.status(200).json({
            message: `Users followed by user ${userId} fetched successfully!`,
            following: result.rows
        });

    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Server error fetching following list.' });
    }
};


exports.getFollowers = async (req, res) => {
    const { userId } = req.params;

    try {
        const targetUserExists = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
        if (targetUserExists.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const result = await db.query(
            `SELECT
                u.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM users u
             JOIN follows f ON u.user_id = f.follower_id
             WHERE f.following_id = $1
             ORDER BY u.username ASC;`,
            [userId]
        );

        res.status(200).json({
            message: `Followers of user ${userId} fetched successfully!`,
            followers: result.rows
        });

    } catch (error) {
        console.error('Error fetching followers list:', error);
        res.status(500).json({ message: 'Server error fetching followers list.' });
    }
};