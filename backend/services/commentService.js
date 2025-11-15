const db = require("../db/db");
const notificationService = require("./notificationService");

exports.addComment = async (postId, userId, content) => {
  const postExists = await db.query(
    "SELECT 1,user_id FROM posts WHERE post_id = $1;",
    [postId]
  );
  if (postExists.rows.length === 0) {
    throw new Error("Post not found.");
  }

  const result = await db.query(
    `INSERT INTO comments (post_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING comment_id, post_id, user_id, content, timestamp;`,
    [postId, userId, content]
  );

  const recipientId = postExists.rows[0].user_id;
  notificationService.createNotification(
    recipientId,
    userId,
    "comment",
    `commented: "${content.substring(0, 50)}..."`,
    postId,
    null
  );

  return result.rows[0];
};

exports.getCommentsForPost = async (postId) => {
  const postExists = await db.query("SELECT 1 FROM posts WHERE post_id = $1;", [
    postId,
  ]);
  if (postExists.rows.length === 0) {
    throw new Error("Post not found.");
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
  return result.rows;
};
