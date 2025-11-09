const db = require('../db/db');

exports.addStory = async (req, res) => {
    const userId = req.user.user_id;
    const { content, media_url, content_type } = req.body;

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
        const result = await db.query(
            `INSERT INTO stories (user_id, content, media_url, content_type)
             VALUES ($1, $2, $3, $4)
             RETURNING story_id, user_id, content, media_url, content_type, timestamp, expires_at;`,
            [userId, content || null, media_url || null, content_type] // Use null for optional fields
        );

        res.status(201).json({
            message: 'Story created successfully!',
            story: result.rows[0]
        });

    } catch (error) {
        console.error('Error adding story:', error);
        res.status(500).json({ message: 'Server error adding story.' });
    }
};


exports.getStoriesFeed = async (req, res) => {
    const userId = req.user.user_id; // The authenticated user

    try {
        const result = await db.query(
            `SELECT
                s.story_id,
                s.content,
                s.media_url,
                s.content_type,
                s.timestamp,
                s.expires_at,
                s.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM stories s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.expires_at > CURRENT_TIMESTAMP -- Only active stories
               AND (
                    s.user_id = $1 -- Include current user's own stories
                 OR s.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1) -- Include stories from followed users
               )
             ORDER BY s.timestamp DESC;`,
            [userId]
        );

        res.status(200).json({
            message: 'Stories feed fetched successfully!',
            stories: result.rows
        });

    } catch (error) {
        console.error('Error fetching stories feed:', error);
        res.status(500).json({ message: 'Server error fetching stories feed.' });
    }
};


exports.getUserStories = async (req, res) => {
    const { userId } = req.params;

    try {
        const targetUserExists = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
        if (targetUserExists.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const result = await db.query(
            `SELECT
                s.story_id,
                s.content,
                s.media_url,
                s.content_type,
                s.timestamp,
                s.expires_at,
                s.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM stories s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.user_id = $1
               AND s.expires_at > CURRENT_TIMESTAMP -- Only active stories
             ORDER BY s.timestamp DESC;`,
            [userId]
        );

        res.status(200).json({
            message: `Stories for user ${userId} fetched successfully!`,
            stories: result.rows
        });

    } catch (error) {
        console.error(`Error fetching stories for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error fetching user stories.' });
    }
};

exports.toggleStoryLike = async (req, res) => {
    const userId = req.user.user_id;
    const { storyId } = req.params;

    try {
        const storyExists = await db.query('SELECT 1 FROM stories WHERE story_id = $1 AND expires_at > CURRENT_TIMESTAMP;', [storyId]);
        if (storyExists.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found or expired.' });
        }

        const existingLike = await db.query(
            `SELECT like_id FROM story_likes WHERE story_id = $1 AND user_id = $2;`,
            [storyId, userId]
        );

        if (existingLike.rows.length > 0) {
            await db.query(`DELETE FROM story_likes WHERE story_id = $1 AND user_id = $2;`, [storyId, userId]);
            res.status(200).json({ message: 'Story unliked successfully.', liked: false });
        } else {
            await db.query(
                `INSERT INTO story_likes (story_id, user_id) VALUES ($1, $2);`,
                [storyId, userId]
            );
            res.status(201).json({ message: 'Story liked successfully!', liked: true });
        }

    } catch (error) {
        console.error('Error toggling story like:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Already liked this story.' });
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
        const storyExists = await db.query('SELECT 1 FROM stories WHERE story_id = $1 AND expires_at > CURRENT_TIMESTAMP;', [storyId]);
        if (storyExists.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found or expired.' });
        }

        // Check if user already reacted to this story
        const existingReaction = await db.query(
            `SELECT reaction_id FROM reactions WHERE story_id = $1 AND user_id = $2;`,
            [storyId, userId]
        );

        let message, status;
        if (existingReaction.rows.length > 0) {
            // Update existing reaction
            await db.query(
                `UPDATE reactions SET reaction = $3, timestamp = CURRENT_TIMESTAMP WHERE story_id = $1 AND user_id = $2 RETURNING reaction_id;`,
                [storyId, userId, reaction]
            );
            message = 'Story reaction updated successfully!';
            status = 200;
        } else {
            // Insert new reaction
            await db.query(
                `INSERT INTO reactions (story_id, user_id, reaction) VALUES ($1, $2, $3) RETURNING reaction_id;`,
                [storyId, userId, reaction]
            );
            message = 'Story reacted to successfully!';
            status = 201;
        }

        res.status(status).json({
            message,
            storyId: parseInt(storyId),
            userId: userId,
            reaction: reaction
        });

    } catch (error) {
        console.error('Error adding/updating story reaction:', error);
        res.status(500).json({ message: 'Server error adding/updating story reaction.' });
    }
};

exports.getStoryReactions = async (req, res) => {
    const { storyId } = req.params;

    try {
        const storyExists = await db.query('SELECT 1 FROM stories WHERE story_id = $1 AND expires_at > CURRENT_TIMESTAMP;', [storyId]);
        if (storyExists.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found or expired.' });
        }

        const result = await db.query(
            `SELECT
                r.reaction_id,
                r.reaction,
                r.timestamp,
                r.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM reactions r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.story_id = $1
             ORDER BY r.timestamp ASC;`,
            [storyId]
        );

        res.status(200).json({
            message: 'Story reactions fetched successfully!',
            reactions: result.rows
        });

    } catch (error) {
        console.error('Error fetching story reactions:', error);
        res.status(500).json({ message: 'Server error fetching story reactions.' });
    }
};