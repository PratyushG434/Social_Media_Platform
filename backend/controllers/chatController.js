const chatService = require('../services/chatService');  
const messageService = require('../services/messageService');

/**
 * Initiates a new chat between the authenticated user and a target user,
 * or returns the existing chat if it already exists.
 */
exports.createChat = async (req, res) => {
    const requesterId = req.user.user_id; // The authenticated user
    const { targetUserId } = req.body;

    // Validate input types
    if (!targetUserId || isNaN(parseInt(targetUserId))) {
        return res.status(400).json({ message: 'Valid targetUserId is required.' });
    }
    const parsedTargetUserId = parseInt(targetUserId);

    try {
        const { chat, created } = await chatService.createOrGetChat(requesterId, parsedTargetUserId);

        if (created) {
            res.status(201).json({
                message: 'Chat created successfully!',
                chat: chat
            });
        } else {
            res.status(200).json({
                message: 'Chat already exists, returning existing chat.',
                chat: chat
            });
        }

    } catch (error) {
        console.error('Error creating/getting chat:', error);
        if (error.message === 'Cannot start a chat with yourself.') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Target user not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error processing chat request.' });
    }
};

 

exports.getUserChats = async (req, res) => {
    const userId = req.user.user_id; // The authenticated user

    try {
        const chats = await chatService.getUserChats(userId);

        res.status(200).json({
            message: 'User chats fetched successfully!',
            chats: chats
        });

    } catch (error) {
        console.error('Error fetching user chats:', error);
        if (error.message === 'User not found.') { // Should ideally not happen if JWT is valid
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching user chats.' });
    }
};


/**
 * Sends a new message within a specific chat.
 * This route is protected. The sender must be a participant in the chat.
 * Expects 'content' in the request body.
 */
exports.sendMessage = async (req, res) => {
    const senderId = req.user.user_id;
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    try {
        // --- MODIFIED: Use messageService.sendMessage ---
        const newMessage = await messageService.sendMessage(parseInt(chatId), senderId, content);

        res.status(201).json({
            message: 'Message sent successfully!',
            message: newMessage // Return the rich message object
        });

    } catch (error) {
        console.error('Error sending message:', error);
        if (error.message === 'Message content cannot be empty.') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Chat not found or user is not a participant.') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error sending message.' });
    }
};

/**
 * Gets all messages for a specific chat.
 * This route is protected. The requester must be a participant in the chat.
 */
exports.getChatMessages = async (req, res) => {
    const currentUserId = req.user.user_id;
    const { chatId } = req.params;

    try {
        // --- MODIFIED: Use messageService.getChatMessages ---
        const messages = await messageService.getChatMessages(parseInt(chatId), currentUserId);

        res.status(200).json({
            message: 'Chat messages fetched successfully!',
            messages: messages
        });

    } catch (error) {
        console.error('Error fetching chat messages:', error);
        if (error.message === 'Chat not found or user is not a participant.') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error fetching chat messages.' });
    }
};
