const db = require("../db/db");

exports.createNotification = async (
  recipientId,
  senderId,
  type,
  content,
  postId = null,
  storyId = null
) => {
  // Prevent self-notification
  if (recipientId === senderId && type !== "admin") return;

  try {
    const result = await db.query(
      `INSERT INTO notifications 
             (recipient_id, sender_id, type, content, post_id, story_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING notification_id, timestamp;`,
      [recipientId, senderId, type, content, postId, storyId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

exports.getNotificationsByRecipientId = async (recipientId) => {
  const result = await db.query(
    `SELECT 
            n.notification_id,
            n.sender_id,
            n.post_id,
            n.story_id,
            n.type,
            n.content,
            n.is_read,
            n.timestamp,
            -- Sender details
            u.username AS sender_username,
            u.display_name AS sender_display_name,
            u.profile_pic_url AS sender_profile_pic_url,
            -- Related post preview (optional)
            p.media_url AS post_media_url
         FROM notifications n
         LEFT JOIN users u ON n.sender_id = u.user_id
         LEFT JOIN posts p ON n.post_id = p.post_id
         WHERE n.recipient_id = $1
         ORDER BY n.timestamp DESC
         LIMIT 50;`,
    [recipientId]
  );
  return result.rows;
};

exports.markNotificationsAsRead = async (recipientId) => {
  await db.query(
    `UPDATE notifications
         SET is_read = TRUE
         WHERE recipient_id = $1 AND is_read = FALSE;`,
    [recipientId]
  );
  return true;
};
