const db = require('../db/db');


exports.toggleLike = async (req, res) => {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    try {
        const postExists = await db.query('SELECT 1 FROM posts WHERE post_id = $1;', [postId]);
        if (postExists.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // if the user has already liked this post
        const existingLike = await db.query(
            `SELECT like_id FROM likes WHERE post_id = $1 AND user_id = $2;`,
            [postId, userId]
        );

        if (existingLike.rows.length > 0) {
            // If existing like is found, UNLIKE the post
            await db.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2;`, [postId, userId]);
            res.status(200).json({ message: 'Post unliked successfully.', liked: false });
        } else {
            // If no existing like, LIKE the post
            await db.query(
                `INSERT INTO likes (post_id, user_id) VALUES ($1, $2);`,
                [postId, userId]
            );
            res.status(201).json({ message: 'Post liked successfully!', liked: true });
        }

    } catch (error) {
        console.error('Error toggling like on post:', error);
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Already liked this post.' });
        }
        res.status(500).json({ message: 'Server error toggling like.' });
    }
};

exports.getLikesCountForPost = async (req, res) => {
    const { id: postId } = req.params;

    try {
        //  if the post exists
        const postExists = await db.query('SELECT 1 FROM posts WHERE post_id = $1;', [postId]);
        if (postExists.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // count number of likes for post_id
        const result = await db.query(
            `SELECT COUNT(*)::int AS likes_count,
                    EXISTS (
                        SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2
                    ) AS user_has_liked
             FROM likes WHERE post_id = $1;`,
            [postId, req.user ? req.user.user_id : null]
        );

        const { likes_count, user_has_liked } = result.rows[0];

        res.status(200).json({
            message: 'Likes count fetched successfully!',
            postId: parseInt(postId),
            likesCount: likes_count,
            userHasLiked: user_has_liked
        });

    } catch (error) {
        console.error('Error fetching likes count:', error);
        res.status(500).json({ message: 'Server error fetching likes count.' });
    }
};