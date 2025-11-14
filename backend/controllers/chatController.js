// backend/controllers/chatController.js

const chatService = require('../services/chatService'); // Import the chat service

/**
 * Initiates a new chat between the authenticated user and a target user,
 * or returns the existing chat if it already exists.
 * This route is protected.
 * Expects 'targetUserId' in the request body.
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

/**
 * Get all chats for the authenticated user.
 * (Will be implemented in the next step)
 */
exports.getUserChats = async (req, res) => {
    // Placeholder for getting all chats of the authenticated user
    res.status(501).json({ message: 'Not Implemented: Get User Chats' });
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
