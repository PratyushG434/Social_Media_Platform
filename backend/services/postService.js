const db = require('../db/db');

exports.createPost = async (userId, content, media_url, content_type) => {
    const result = await db.query(
        `INSERT INTO posts (user_id, content, media_url, content_type)
         VALUES ($1, $2, $3, $4)
         RETURNING post_id, user_id, content, media_url, content_type, timestamp;`,
        [userId, content || null, media_url || null, content_type]
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
            u.profile_pic_url
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
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
            u.profile_pic_url
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.post_id = $1;`,
        [postId]
    );
    return result.rows[0] || null;
};


exports.updatePost = async (postId, userId, updateData) => {
    // verify the user owns the post?
    const postOwnerResult = await db.query(
        `SELECT user_id FROM posts WHERE post_id = $1;`,
        [postId]
    );
    const post = postOwnerResult.rows[0];

    if (!post) {
        return null;
    }
    if (post.user_id !== userId) {
        throw new Error('Not authorized to update this post.'); // Authorization check
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
    // verify the user owns the post?
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