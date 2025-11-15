// backend/services/messageService.js

const db = require('../db/db');

const getChatIfParticipant = async (chatId, userId) => {
    const result = await db.query(
        `SELECT chat_id, user1_id, user2_id, status FROM chats WHERE chat_id = $1 AND (user1_id = $2 OR user2_id = $2);`,
        [chatId, userId]
    );
    return result.rows[0] || null;
};


// Service function to send a new message in a specific chat and return a rich message object.
exports.sendMessage = async (chatId, senderId, content) => {
    if (!content || content.trim() === '') {
        throw new Error('Message content cannot be empty.');
    }

    // const chat = await getChatIfParticipant(chatId, senderId);
    // if (!chat) {
    //     throw new Error('Chat not found or user is not a participant.');
    // }

    // Insert the new message
    const insertResult = await db.query(
        `INSERT INTO messages (chat_id, sender_id, content, status)
         VALUES ($1, $2, $3, 'Sent')
         RETURNING message_id;`, // Only return message_id, then fetch full details
        [chatId, senderId, content]
    );

    const messageId = insertResult.rows[0].message_id;

    // Fetch the newly created message with sender details
    const richMessageResult = await db.query(
        `SELECT
            m.message_id,
            m.chat_id,
            m.sender_id,
            m.content,
            m.status,
            m.timestamp,
            s.username AS sender_username,
            s.display_name AS sender_display_name,
            s.profile_pic_url AS sender_profile_pic_url,
            s.cloudinary_public_id AS sender_cloudinary_public_id
         FROM messages m
         JOIN users s ON m.sender_id = s.user_id
         WHERE m.message_id = $1;`,
        [messageId]
    );

    return richMessageResult.rows[0]; // Return the rich message object
};


// Service function to get all messages for a specific chat.
exports.getChatMessages = async (chatId, currentUserId) => {
    // const chat = await getChatIfParticipant(chatId, currentUserId);
    // if (!chat) {
    //     throw new Error('Chat not found or user is not a participant.');
    // }

    const result = await db.query(
        `SELECT
            m.message_id,
            m.chat_id,
            m.sender_id,
            m.content,
            m.status,
            m.timestamp,
            s.username AS sender_username,
            s.display_name AS sender_display_name,
            s.profile_pic_url AS sender_profile_pic_url,
            s.cloudinary_public_id AS sender_cloudinary_public_id
         FROM messages m
         JOIN users s ON m.sender_id = s.user_id
         WHERE m.chat_id = $1
         ORDER BY m.timestamp ASC;`,
        [chatId]
    );

    return result.rows;
};