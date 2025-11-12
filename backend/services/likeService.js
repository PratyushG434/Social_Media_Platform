const db = require('../db/db');


const postExists = async (postId) => {
    const result = await db.query('SELECT 1 FROM posts WHERE post_id = $1;', [postId]);
    return result.rows.length > 0;
};


exports.toggleLike = async (postId, userId) => {
    // console.log(userId, postId);
    if (!(await postExists(postId))) {

        throw new Error('Post not found.');
    }

    const existingLike = await db.query(
        `SELECT like_id FROM likes WHERE post_id = $1 AND user_id = $2;`,
        [postId, userId]
    );

    if (existingLike.rows.length > 0) {
        await db.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2;`, [postId, userId]);
        return false; // Unliked
    } else {
        await db.query(
            `INSERT INTO likes (post_id, user_id) VALUES ($1, $2);`,
            [postId, userId]
        );
        return true; // Liked
    }
};


exports.getLikesCountForPost = async (postId, currentUserId) => {
    if (!(await postExists(postId))) {
        throw new Error('Post not found.');
    }

    const result = await db.query(
        `SELECT COUNT(*)::int AS likes_count,
                EXISTS (
                    SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2
                ) AS user_has_liked
         FROM likes WHERE post_id = $1;`,
        [postId, currentUserId]
    );

    return {
        likesCount: result.rows[0].likes_count,
        userHasLiked: result.rows[0].user_has_liked
    };
};