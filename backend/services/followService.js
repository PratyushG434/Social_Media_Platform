const db = require("../db/db");

const userExists = async (userId) => {
  const result = await db.query("SELECT 1 FROM users WHERE user_id = $1;", [
    userId,
  ]);
  return result.rows.length > 0;
};

exports.toggleFollow = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error("Users cannot follow themselves.");
  }

  if (!(await userExists(followingId))) {
    throw new Error("Target user not found.");
  }

  const existingFollow = await db.query(
    `SELECT follower_id FROM follows WHERE follower_id = $1 AND following_id = $2;`,
    [followerId, followingId]
  );

  if (existingFollow.rows.length > 0) {
    await db.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2;`,
      [followerId, followingId]
    );
    return false; // Unfollowed
  } else {
    await db.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2);`,
      [followerId, followingId]
    );
    notificationService.createNotification(
      followingId, // The user being followed is the recipient
      followerId, // The follower is the sender
      "follow",
      "started following you",
      null,
      null
    );

    return true; // Followed
  }
};

exports.getFollowing = async (userId) => {
  if (!(await userExists(userId))) {
    throw new Error("User not found.");
  }

  const result = await db.query(
    `SELECT
            u.user_id,
            u.username,
            u.display_name,
            u.profile_pic_url
         FROM users u
         JOIN follows f ON u.user_id = f.following_id
         WHERE f.follower_id = $1
         ORDER BY u.username ASC;`,
    [userId]
  );
  return result.rows;
};

exports.getFollowers = async (userId) => {
  if (!(await userExists(userId))) {
    throw new Error("User not found.");
  }

  const result = await db.query(
    `SELECT
            u.user_id,
            u.username,
            u.display_name,
            u.profile_pic_url
         FROM users u
         JOIN follows f ON u.user_id = f.follower_id
         WHERE f.following_id = $1
         ORDER BY u.username ASC;`,
    [userId]
  );
  return result.rows;
};
