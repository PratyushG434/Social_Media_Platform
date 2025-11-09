const db = require('../db/db');


exports.addComment = async (req, res) => {
    const userId = req.user.user_id;
    const { id: postIdString } = req.params;


    const postId = parseInt(postIdString, 10);


    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }
    if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid Post ID provided.' });
    }


    try {
        // Verify if the post exists
        const postExists = await db.query('SELECT 1 FROM posts WHERE post_id = $1;', [postId]);
        if (postExists.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const result = await db.query(
            `INSERT INTO comments (post_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING comment_id, post_id, user_id, content, timestamp;`,
            [postId, userId, content]
        );

        res.status(201).json({
            message: 'Comment added successfully!',
            comment: result.rows[0]
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error adding comment.' });
    }
};

exports.getCommentsForPost = async (req, res) => {
    const { id: postIdString } = req.params; // Get as string initially
    const postId = parseInt(postIdString, 10);   // Convert to integer
    if (isNaN(postId)) {
        return res.status(400).json({ message: 'Invalid Post ID provided.' });
    }


    try {
        const postExists = await db.query('SELECT 1 FROM posts WHERE post_id = $1;', [postId]);
        if (postExists.rows.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const result = await db.query(
            `SELECT
                c.comment_id,
                c.content,
                c.timestamp,
                c.user_id,
                u.username,
                u.display_name,
                u.profile_pic_url
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.post_id = $1
             ORDER BY c.timestamp ASC;`,
            [postId]
        );

        res.status(200).json({
            message: 'Comments fetched successfully!',
            comments: result.rows
        });

    } catch (error) {
        console.error('Error fetching comments for post:', error);
        res.status(500).json({ message: 'Server error fetching comments.' });
    }
};