// backend/services/chatService.js

const db = require('../db/db');

/**
 * Helper function to ensure user exists.
 * (Can be reused from other services or defined here)
 */
const userExists = async (userId) => {
    const result = await db.query('SELECT 1 FROM users WHERE user_id = $1;', [userId]);
    return result.rows.length > 0;
};


exports.createOrGetChat = async (requesterId, targetUserId) => {
    // 1. Basic Validation: Prevent chat with self
    if (requesterId === targetUserId) {
        throw new Error('Cannot start a chat with yourself.');
    }

    // 2. Validate existence of target user
    if (!(await userExists(targetUserId))) {
        throw new Error('Target user not found.');
    }

    // 3. Determine canonical user1_id and user2_id based on numerical order
    const user1_id = Math.min(requesterId, targetUserId);
    const user2_id = Math.max(requesterId, targetUserId);

    try {
        // 4. Check if a chat already exists between these two users (in canonical order)
        const existingChatResult = await db.query(
            `SELECT chat_id, user1_id, user2_id, status, created_at
             FROM chats
             WHERE user1_id = $1 AND user2_id = $2;`,
            [user1_id, user2_id]
        );

        if (existingChatResult.rows.length > 0) {
            // 5. If chat exists, return the existing chat
            return {
                chat: existingChatResult.rows[0],
                created: false // Indicate that no new chat was created
            };
        } else {
            // 6. If no chat exists, create a new one
            const newChatResult = await db.query(
                `INSERT INTO chats (user1_id, user2_id, status)
                 VALUES ($1, $2, 'Active') -- Default status to 'Active'
                 RETURNING chat_id, user1_id, user2_id, status, created_at;`,
                [user1_id, user2_id]
            );
            return {
                chat: newChatResult.rows[0],
                created: true // Indicate that a new chat was created
            };
        }

    } catch (error) {
        console.error('Error in createOrGetChat service:', error);
        // Specifically catch unique_violation if somehow reached, though logic above prevents it
        if (error.code === '23505') {
            throw new Error('Chat already exists (unique constraint violation).');
        }
        throw new Error('Database error creating or getting chat.');
    }
};

exports.getUserChats = async (userId) => {
    // 1. Validate existence of the user
    if (!(await userExists(userId))) {
        throw new Error('User not found.');
    }

    // 2. Fetch chats
    const result = await db.query(
        `SELECT
            c.chat_id,
            c.user1_id,
            c.user2_id,
            c.status,
            c.created_at,
            -- Determine the ID of the other participant
            CASE
                WHEN c.user1_id = $1 THEN c.user2_id
                ELSE c.user1_id
            END AS other_user_id,
            -- Select details of the other participant by joining users table
            ou.username AS other_username,
            ou.display_name AS other_display_name,
            ou.profile_pic_url AS other_profile_pic_url,
            ou.cloudinary_public_id AS other_cloudinary_public_id
         FROM chats c
         JOIN users ou ON -- Join with users table to get details of the OTHER user
             (CASE
                WHEN c.user1_id = $1 THEN c.user2_id
                ELSE c.user1_id
             END) = ou.user_id
         WHERE c.user1_id = $1 OR c.user2_id = $1 -- Filter chats where this user is a participant
         ORDER BY c.created_at DESC;`,  
        [userId]
    );

    return result.rows;
};