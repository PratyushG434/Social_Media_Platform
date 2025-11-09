const db = require('../db/db');


const userExists = async (userId) => {
    const result = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
    return result.rows.length > 0;
};


const storyExistsAndIsActive = async (storyId) => {
    const result = await db.query('SELECT 1 FROM stories WHERE story_id = $1 AND expires_at > CURRENT_TIMESTAMP;', [storyId]);
    return result.rows.length > 0;
};



exports.addStory = async (userId, content, media_url, content_type) => {
    const result = await db.query(
        `INSERT INTO stories (user_id, content, media_url, content_type)
         VALUES ($1, $2, $3, $4)
         RETURNING story_id, user_id, content, media_url, content_type, timestamp, expires_at;`,
        [userId, content || null, media_url || null, content_type]
    );
    return result.rows[0];
};


exports.getStoriesFeed = async (userId) => {
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
         WHERE s.expires_at > CURRENT_TIMESTAMP
           AND (
                s.user_id = $1
             OR s.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
           )
         ORDER BY s.timestamp DESC;`,
        [userId]
    );
    return result.rows;
};


exports.getUserStories = async (targetUserId) => {
    if (!(await userExists(targetUserId))) {
        throw new Error('User not found.');
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
           AND s.expires_at > CURRENT_TIMESTAMP
         ORDER BY s.timestamp DESC;`,
        [targetUserId]
    );
    return result.rows;
};


exports.toggleStoryLike = async (storyId, userId) => {
    if (!(await storyExistsAndIsActive(storyId))) {
        throw new Error('Story not found or expired.');
    }

    const existingLike = await db.query(
        `SELECT like_id FROM story_likes WHERE story_id = $1 AND user_id = $2;`,
        [storyId, userId]
    );

    if (existingLike.rows.length > 0) {
        await db.query(`DELETE FROM story_likes WHERE story_id = $1 AND user_id = $2;`, [storyId, userId]);
        return false; // Unliked
    } else {
        await db.query(
            `INSERT INTO story_likes (story_id, user_id) VALUES ($1, $2);`,
            [storyId, userId]
        );
        return true; // Liked
    }
};


exports.addOrUpdateStoryReaction = async (storyId, userId, reaction) => {
    if (!(await storyExistsAndIsActive(storyId))) {
        throw new Error('Story not found or expired.');
    }

    const existingReaction = await db.query(
        `SELECT reaction_id FROM reactions WHERE story_id = $1 AND user_id = $2;`,
        [storyId, userId]
    );

    let result;
    if (existingReaction.rows.length > 0) {
        result = await db.query(
            `UPDATE reactions SET reaction = $3, timestamp = CURRENT_TIMESTAMP WHERE story_id = $1 AND user_id = $2 RETURNING reaction_id;`,
            [storyId, userId, reaction]
        );
    } else {
        result = await db.query(
            `INSERT INTO reactions (story_id, user_id, reaction) VALUES ($1, $2, $3) RETURNING reaction_id;`,
            [storyId, userId, reaction]
        );
    }

    return { reactionId: result.rows[0].reaction_id, storyId, userId, reaction };
};


exports.getStoryReactions = async (storyId) => {
    if (!(await storyExistsAndIsActive(storyId))) {
        throw new Error('Story not found or expired.');
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
    return result.rows;
};