const db = require("../db/db");

exports.createPost = async (req, res) => {

    const userid = req.user.user_id;
    const { content, media_url, content_type } = req.body;
    if (!content || (!media_url && !content_type === "text") || !content_type) {
        return res.status(400).json({ message: "Post must contain either content or media URL." });
    }
    if (!content_type || !["text", "image", "video"].includes(content_type)) {
        return res.status(400).json({ message: "Invalid content type. Supported types: text, image, video" });
    }

    try {
        const result = await db.query(
            "INSERT INTO posts (user_id, content, media_url, content_type) VALUES ($1, $2, $3, $4) RETURNING post_id, user_id, content, media_url, content_type, timestamp;",
            [userid, content, media_url, content_type]
        );
        res.status(201).json({
            message: "Post created successfully",
            post: result.rows[0]
        });
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Error creating post" });
    }

}


exports.getPosts = async (req, res) => {
    try {
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
             ORDER BY p.timestamp DESC;` // Order by newest posts first
        );

        res.status(200).json({
            message: "Posts fetched successfully",
            posts: result.rows
        });
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts" });
    }
}

exports.getPostById = async (req, res) => {
    const { id } = req.params;
    try {
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
            [id]
        );
        const post = result.rows[0];
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({
            message: "Post fetched successfully",
            post: post
        });
    }
    catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Error fetching post" });
    }
}




exports.updatePost = async (req, res) => {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    const { content, media_url, content_type } = req.body;
    if (!content || (!media_url && !content_type === "text") || !content_type) {
        return res.status(400).json({ message: "Post must contain either content or media URL." });
    }
    if (!content_type || !["text", "image", "video"].includes(content_type)) {
        return res.status(400).json({ message: "Invalid content type. Supported types: text, image, video" });
    }

    try {
        const postResult = await db.query(
            `SELECT user_id FROM posts WHERE post_id = $1;`,
            [postId]
        );
        const post = postResult.rows[0];
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user_id !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this post" });
        }

        const updateFields = [];
        const queryParams = [postId]; // First parameter is always postId for WHERE clause
        let paramIndex = 2; // Start parameter index for content, media_url, content_type

        if (content !== undefined) {
            updateFields.push(`content = $${paramIndex++}`);
            queryParams.push(content);
        }
        if (media_url !== undefined) {
            updateFields.push(`media_url = $${paramIndex++}`);
            queryParams.push(media_url);
        }
        if (content_type !== undefined) {
            updateFields.push(`content_type = $${paramIndex++}`);
            queryParams.push(content_type);
        }

        // If no fields to update after validation (should be caught by initial check, but defensive)
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const query = `
            UPDATE posts
            SET ${updateFields.join(', ')},
                timestamp = CURRENT_TIMESTAMP -- Optionally update timestamp on modification
            WHERE post_id = $1
            RETURNING post_id, user_id, content, media_url, content_type, timestamp;
        `;

        const result = await db.query(query, queryParams);

        res.status(200).json({
            message: 'Post updated successfully!',
            post: result.rows[0]
        });


    }
    catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Error updating post" });
    }
}

exports.deletePost = async (req, res) => {
    const userId = req.user.user_id;
    const { id: postId } = req.params;

    try {
        // verify that the authenticated user owns the post
        const postResult = await db.query(
            `SELECT user_id FROM posts WHERE post_id = $1;`,
            [postId]
        );

        const post = postResult.rows[0];

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Authorization check - ensure the user deleting is the post owner
        if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post.' });
        }

        await db.query(`DELETE FROM posts WHERE post_id = $1;`, [postId]);

        res.status(200).json({ message: 'Post deleted successfully!' });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error deleting post.' });
    }
};
