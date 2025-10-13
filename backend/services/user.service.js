import { query } from '../../config/db.js';

export const getProfile = async (username) => {
    // This query uses subqueries to get the follower and following counts.
    const getProfileQuery = `
        SELECT
            user_id,
            username,
            bio,
            profile_pic_url,
            join_date,
            (SELECT COUNT(*) FROM follows WHERE following_id = users.user_id) AS followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = users.user_id) AS following_count,
            (SELECT json_agg(posts.*) FROM posts WHERE posts.user_id = users.user_id) AS posts
        FROM users
        WHERE username = $1
    `;
    const { rows } = await query(getProfileQuery, [username]);
    
    return rows[0] || null;
};

export const follow = async (followerId, followingId) => {
    const followQuery = 'INSERT INTO follows(follower_id, following_id) VALUES($1, $2)';
    
    try {
        await query(followQuery, [followerId, followingId]);
        return { success: true };
    } catch (error) {
        // Handle unique constraint violation (error code '23505' for PostgreSQL)
        if (error.code === '23505') {
            return { success: false, message: "Already following this user" };
        }
        console.error(error);
        return { success: false, message: "Could not follow user" };
    }
};

export const unfollow = async (followerId, followingId) => {
    const unfollowQuery = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
    
    try {
        await query(unfollowQuery, [followerId, followingId]);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Could not unfollow user" };
    }
};