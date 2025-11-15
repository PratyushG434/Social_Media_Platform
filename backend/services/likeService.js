const db = require("../db/db");
const notificationService = require("./notificationService");

const postExists = async (postId) => {
  const result = await db.query("SELECT 1 FROM posts WHERE post_id = $1;", [
    postId,
  ]);
  return result.rows.length > 0;
};

exports.toggleLike = async (postId, userId) => {
  if (!(await postExists(postId))) {
    throw new Error("Post not found.");
  }

  const existingLike = await db.query(
    `SELECT like_id FROM likes WHERE post_id = $1 AND user_id = $2;`,
    [postId, userId]
  );

  if (existingLike.rows.length > 0) {
    // --- UNLIKE Action ---
    await db.query(`DELETE FROM likes WHERE post_id = $1 AND user_id = $2;`, [
      postId,
      userId,
    ]);

    // Note: No need to notify on UNLIKE.

    return false; // Unliked
  } else {
    // --- LIKE Action ---
    await db.query(`INSERT INTO likes (post_id, user_id) VALUES ($1, $2);`, [
      postId,
      userId,
    ]);

    // --- NEW: Create Notification Logic (Protection against self-like spam) ---
    const postOwnerResult = await db.query(
      `SELECT user_id FROM posts WHERE post_id = $1`,
      [postId]
    );

    if (postOwnerResult.rows.length > 0) {
      const recipientId = postOwnerResult.rows[0].user_id;

      // 1. IMPORTANT: Prevent notifying the user if they liked their own post.
      if (recipientId !== userId) {
        notificationService.createNotification(
          recipientId,
          userId,
          "like",
          "liked your post",
          postId,
          null
        );
      }
      // 2. Since the notification logic only runs on INSERT (the "like" action),
      //    we inherently avoid spamming notifications when a user unlikes a post.
    }
    // --- END NEW ---

    return true; // Liked
  }
};

exports.getLikesCountForPost = async (postId, currentUserId) => {
  if (!(await postExists(postId))) {
    throw new Error("Post not found.");
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
    userHasLiked: result.rows[0].user_has_liked,
  };
};
