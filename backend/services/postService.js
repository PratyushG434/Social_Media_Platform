const db = require('../db/db');

const userExists = async (userId) => {
    const result = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
    return result.rows.length > 0;
};

exports.createPost = async (userId, content, media_url, content_type, public_id) => {
    const result = await db.query(
        `INSERT INTO posts (user_id, content, media_url, content_type, cloudinary_public_id)
         VALUES ($1, $2, $3, $4)
         RETURNING post_id, user_id, content, media_url, content_type, timestamp;`,
        [userId, content || null, media_url || null, content_type, public_id || null]
    );
    return result.rows[0];
};


exports.getAllPosts = async () => {
    const result = await db.query(
        `SELECT
            p.post_id,
            p.content,
            p.media_url,
            p.content_type,
            p.timestamp,
            p.user_id,
            u.username,
            u.display_name,
            u.profile_pic_url,
            COUNT(DISTINCT l.like_id)::int AS likes_count,     -- Count distinct likes
            COUNT(DISTINCT c.comment_id)::int AS comments_count -- Count distinct comments
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         LEFT JOIN likes l ON p.post_id = l.post_id        -- LEFT JOIN to include posts with no likes
         LEFT JOIN comments c ON p.post_id = c.post_id     -- LEFT JOIN to include posts with no comments
         GROUP BY p.post_id, u.user_id                      -- Group by post and user details
         ORDER BY p.timestamp DESC;`
    );
    return result.rows;
};



exports.getPostById = async (postId) => {
    const result = await db.query(
        `SELECT
            p.post_id,
            p.content,
            p.media_url,
            p.content_type,
            p.timestamp,
            p.user_id,
            u.username,
            u.display_name,
            u.profile_pic_url,
            COUNT(DISTINCT l.like_id)::int AS likes_count,
            COUNT(DISTINCT c.comment_id)::int AS comments_count
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         LEFT JOIN likes l ON p.post_id = l.post_id
         LEFT JOIN comments c ON p.post_id = c.post_id
         WHERE p.post_id = $1
         GROUP BY p.post_id, u.user_id
         ORDER BY p.timestamp DESC;`,
        [postId]
    );
    return result.rows[0] || null;
};


exports.getPostsByUserId = async (userId) => {
    if (!(await userExists(userId))) {
        throw new Error('User not found.');
    }

    const result = await db.query(
        `SELECT
            p.post_id,
            p.content,
            p.media_url,
            p.content_type,
            p.timestamp,
            p.user_id,
            u.username,
            u.display_name,
            u.profile_pic_url,
            COUNT(DISTINCT l.like_id)::int AS likes_count,
            COUNT(DISTINCT c.comment_id)::int AS comments_count
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         LEFT JOIN likes l ON p.post_id = l.post_id
         LEFT JOIN comments c ON p.post_id = c.post_id
         WHERE p.user_id = $1
         GROUP BY p.post_id, u.user_id
         ORDER BY p.timestamp DESC;`,
        [userId]
    );
    return result.rows;
};


exports.updatePost = async (postId, userId, updateData) => {
    const postOwnerResult = await db.query(
        `SELECT user_id FROM posts WHERE post_id = $1;`,
        [postId]
    );
    const post = postOwnerResult.rows[0];

    if (!post) {
        return null;
    }
    if (post.user_id !== userId) {
        throw new Error('Not authorized to update this post.');
    }

    const updateFields = [];
    const queryParams = [postId];
    let paramIndex = 2;

    if (updateData.content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        queryParams.push(updateData.content);
    }
    if (updateData.media_url !== undefined) {
        updateFields.push(`media_url = $${paramIndex++}`);
        queryParams.push(updateData.media_url);
    }
    if (updateData.content_type !== undefined) {
        updateFields.push(`content_type = $${paramIndex++}`);
        queryParams.push(updateData.content_type);
    }

    if (updateFields.length === 0) {
        return null;
    }

    const query = `
        UPDATE posts
        SET ${updateFields.join(', ')},
            timestamp = CURRENT_TIMESTAMP
        WHERE post_id = $1
        RETURNING post_id, user_id, content, media_url, content_type, timestamp;
    `;

    const result = await db.query(query, queryParams);
    return result.rows[0];
};

exports.deletePost = async (postId, userId) => {
    const postOwnerResult = await db.query(
        `SELECT user_id FROM posts WHERE post_id = $1;`,
        [postId]
    );
    const post = postOwnerResult.rows[0];

    if (!post) {
        return false;
    }
    if (post.user_id !== userId) {
        throw new Error('Not authorized to delete this post.');
    }

    await db.query(`DELETE FROM posts WHERE post_id = $1;`, [postId]);
    return true;
};