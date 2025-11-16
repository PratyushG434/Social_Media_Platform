const db = require("../db/db");

exports.getTaggedPostsByUser = async (userId) => {
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
    FROM post_tags pt
    JOIN posts p ON pt.post_id = p.post_id
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN likes l ON p.post_id = l.post_id
    LEFT JOIN comments c ON p.post_id = c.post_id
    WHERE pt.user_id = $1
    GROUP BY p.post_id, u.user_id
    ORDER BY p.timestamp DESC;`,
    [userId]
  );
  const posts = result.rows;
  // For each post, fetch tags
  for (const post of posts) {
    const tagsResult = await db.query(
      `SELECT u.user_id, u.username, u.display_name, u.profile_pic_url
       FROM post_tags pt
       JOIN users u ON pt.user_id = u.user_id
       WHERE pt.post_id = $1;`,
      [post.post_id]
    );
    post.tags = tagsResult.rows;
  }
  return posts;
};
// Add tags to post_tags table
exports.addPostTags = async (postId, userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  // Only insert valid user IDs
  const values = userIds.map((uid, idx) => `($1, $${idx + 2})`).join(", ");
  const params = [postId, ...userIds];
  await db.query(
    `INSERT INTO post_tags (post_id, user_id) VALUES ${values} ON CONFLICT DO NOTHING;`,
    params
  );
};

const userExists = async (userId) => {
  const result = await db.query("SELECT 1 FROM users WHERE user_id = $1;", [
    userId,
  ]);
  return result.rows.length > 0;
};

exports.createPost = async (
  userId,
  content,
  media_url,
  content_type,
  cloudinary_public_id
) => {
  const result = await db.query(
    `INSERT INTO posts (user_id, content, media_url, content_type, cloudinary_public_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING post_id, user_id, content, media_url, content_type, cloudinary_public_id, timestamp;`,
    [
      userId,
      content || null,
      media_url || null,
      content_type,
      cloudinary_public_id || null,
    ]
  );
  return result.rows[0];
};

exports.getDiscoveryFeedPosts = async (currentUserId) => {
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
            p.cloudinary_public_id,
            p.likes_count,     -- Now directly selecting from posts table
            p.comments_count,  -- Now directly selecting from posts table
            EXISTS (SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $1) AS user_has_liked
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.user_id != $1
           AND p.user_id NOT IN (
                SELECT following_id
                FROM follows
                WHERE follower_id = $1
            )
         ORDER BY p.timestamp DESC;`, // Removed GROUP BY, as counts are already aggregated
    [currentUserId]
  );
  return result.rows;
};

exports.getFollowingPostsFeed = async (currentUserId) => {
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
            p.cloudinary_public_id,
            p.likes_count,     -- Now directly selecting from posts table
            p.comments_count,  -- Now directly selecting from posts table
            EXISTS (SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = $1) AS user_has_liked
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.user_id IN (
                SELECT following_id
                FROM follows
                WHERE follower_id = $1
            )
         ORDER BY p.timestamp DESC;`, // Removed GROUP BY, as counts are already aggregated
    [currentUserId]
  );
  return result.rows;
};

exports.getVideoPosts = async () => {
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
            p.cloudinary_public_id,
            p.likes_count,
            p.comments_count
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.content_type = 'video' -- NEW: Filter by content_type
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
  const post = result.rows[0] || null;
  if (!post) return null;
  // Fetch tagged users
  const tagsResult = await db.query(
    `SELECT u.user_id, u.username, u.display_name, u.profile_pic_url
     FROM post_tags pt
     JOIN users u ON pt.user_id = u.user_id
     WHERE pt.post_id = $1;`,
    [postId]
  );
  post.tags = tagsResult.rows;
  return post;
};

exports.getPostsByUserId = async (userId) => {
  if (!(await userExists(userId))) {
    throw new Error("User not found.");
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
  const posts = result.rows;
  // For each post, fetch tags
  for (const post of posts) {
    const tagsResult = await db.query(
      `SELECT u.user_id, u.username, u.display_name, u.profile_pic_url
       FROM post_tags pt
       JOIN users u ON pt.user_id = u.user_id
       WHERE pt.post_id = $1;`,
      [post.post_id]
    );
    post.tags = tagsResult.rows;
  }
  return posts;
};

exports.updatePost = async (postId, userId, updateData) => {
  const postOwnerResult = await db.query(
    `SELECT user_id, cloudinary_public_id FROM posts WHERE post_id = $1;`,
    [postId]
  );
  const post = postOwnerResult.rows[0];

  if (!post) {
    return null;
  }
  if (post.user_id !== userId) {
    throw new Error("Not authorized to update this post.");
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
    // If media_url is updated, update its public_id too
    if (updateData.cloudinary_public_id !== undefined) {
      updateFields.push(`cloudinary_public_id = $${paramIndex++}`);
      queryParams.push(updateData.cloudinary_public_id);
    } else {
      // If media_url is set to null, ensure public_id is also null
      if (!updateData.media_url) {
        updateFields.push(`cloudinary_public_id = $${paramIndex++}`);
        queryParams.push(null);
      }
    }
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
        SET ${updateFields.join(", ")},
            timestamp = CURRENT_TIMESTAMP
        WHERE post_id = $1
        RETURNING post_id, user_id, content, media_url, content_type, timestamp;
    `;

  const result = await db.query(query, queryParams);
  return result.rows[0];
};

exports.deletePost = async (postId, userId) => {
  const postOwnerResult = await db.query(
    `SELECT user_id, cloudinary_public_id, content_type FROM posts WHERE post_id = $1;`,
    [postId]
  );
  const post = postOwnerResult.rows[0];

  if (!post) {
    return null;
  }
  if (post.user_id !== userId) {
    throw new Error("Not authorized to delete this post.");
  }

  await db.query(`DELETE FROM posts WHERE post_id = $1;`, [postId]);

  return {
    deleted: true,
    publicId: post.cloudinary_public_id,
    contentType: post.content_type,
  };
};

// Add this to postService.js

exports.getLikedPosts = async (currentUserId) => {
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
            p.cloudinary_public_id,
            p.likes_count,
            p.comments_count,
            -- For liked posts, user_has_liked is always true
            TRUE AS user_has_liked
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         -- Join with likes table to find posts liked by the current user
         JOIN likes l ON p.post_id = l.post_id
         WHERE l.user_id = $1
         ORDER BY l.timestamp DESC;`, // Order by when the user liked the post
    [currentUserId]
  );
  return result.rows;
};
