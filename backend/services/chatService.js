const db = require('../db/db');


// Creates a new chat entry between two users, or returns an existing one.
exports.createOrGetChat = async (requesterId, targetUserId) => {
    if (requesterId === targetUserId) {
        throw new Error('Cannot start a chat with yourself.');
    }

    const user1_id = Math.min(requesterId, targetUserId);
    const user2_id = Math.max(requesterId, targetUserId);

    try {
        const existingChatResult = await db.query(
            `SELECT chat_id, user1_id, user2_id, status, created_at
             FROM chats
             WHERE user1_id = $1 AND user2_id = $2;`,
            [user1_id, user2_id]
        );

        if (existingChatResult.rows.length > 0) {
            return {
                chat: existingChatResult.rows[0],
                created: false
            };
        } else {
            const newChatResult = await db.query(
                `INSERT INTO chats (user1_id, user2_id, status)
                 VALUES ($1, $2, 'Active')
                 RETURNING chat_id, user1_id, user2_id, status, created_at;`,
                [user1_id, user2_id]
            );
            return {
                chat: newChatResult.rows[0],
                created: true
            };
        }

    } catch (error) {
        console.error('Error in createOrGetChat service:', error);
        if (error.code === '23505') {
            throw new Error('Chat already exists (unique constraint violation).');
        }
        throw new Error('Database error creating or getting chat.');
    }
};


// Service function to get all chats for a specific user.
exports.getUserChats = async (userId) => {
     
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
         WHERE (c.user1_id = $1 OR c.user2_id = $1) -- Filter chats where this user is a participant
           AND EXISTS (
                SELECT 1 FROM messages m WHERE m.chat_id = c.chat_id -- NEW: Only include chats with messages
           )
         ORDER BY c.created_at DESC;`, 
        [userId]
    );

    return result.rows;
};