const messageService = require('../services/messageService'); // Import the message service

// Map to keep track of which user is in which chat room
// { userId: [chatId1, chatId2], ... }
const userChatRooms = new Map();

// Map to keep track of connected sockets per user
// { userId: [socket.id1, socket.id2, ...], ... }
const userSockets = new Map();



// Registers all chat-related Socket.IO event handlers for a connected socket.
exports.registerChatHandlers = (io, socket) => {
    const currentUserId = socket.user.user_id;
    const currentUsername = socket.user.username;

    // Add this socket to the list of user's active sockets
    if (!userSockets.has(currentUserId)) {
        userSockets.set(currentUserId, new Set());
    }
    userSockets.get(currentUserId).add(socket.id);

    // 1. Event for joining a chat room
    socket.on('joinChat', async (chatId, callback) => {
        const parsedChatId = parseInt(chatId);
        if (isNaN(parsedChatId)) {
            console.error(`User ${currentUsername} (${currentUserId}) tried to join invalid chat ID: ${chatId}`);
            if (callback) callback({ status: 'error', message: 'Invalid chat ID.' });
            return;
        }

        try {
            // Validate if the user is a participant of this chat
            // Reuse getChatMessages' internal logic for participant check
            // await messageService.getChatMessages(parsedChatId, currentUserId); // no need of this 
            
            socket.join(parsedChatId.toString()); // Join the Socket.IO room (chatId as string)

            // Store which chat rooms this user is in
            if (!userChatRooms.has(currentUserId)) {
                userChatRooms.set(currentUserId, new Set());
            }
            userChatRooms.get(currentUserId).add(parsedChatId);

            console.log(`User ${currentUsername} (${currentUserId}) joined chat room: ${parsedChatId}`);
            if (callback) callback({ status: 'ok', message: `Joined chat ${parsedChatId}` });

            // Optional: Broadcast user joined room (e.g., for online status in chat)
            // io.to(parsedChatId.toString()).emit('userJoined', { userId: currentUserId, username: currentUsername });

        } catch (error) {
            console.error(`Error joining chat ${parsedChatId} for user ${currentUsername} (${currentUserId}):`, error.message);
            if (callback) callback({ status: 'error', message: error.message });
        }
    });

    // 2. Event for sending a message
    socket.on('sendMessage', async (data, callback) => {
        const { chatId, content } = data;
        const parsedChatId = parseInt(chatId);

        if (isNaN(parsedChatId)) {
            console.error(`User ${currentUsername} (${currentUserId}) tried to send message to invalid chat ID: ${chatId}`);
            if (callback) callback({ status: 'error', message: 'Invalid chat ID.' });
            return;
        }

        try {
            // Save message to database via service
            const richMessage = await messageService.sendMessage(parsedChatId, currentUserId, content);

            // Emit the message to all clients in that chat room
            // io.to(roomName).emit(eventName, data)
            io.to(parsedChatId.toString()).emit('receiveMessage', richMessage);

            console.log(`User ${currentUsername} (${currentUserId}) sent message to chat ${parsedChatId}`);
            if (callback) callback({ status: 'ok', message: 'Message sent and broadcasted.', richMessage });

        } catch (error) {
            console.error(`Error sending message to chat ${parsedChatId} for user ${currentUsername} (${currentUserId}):`, error.message);
            if (callback) callback({ status: 'error', message: error.message });
        }
    });

    // 3. Handle disconnection
    socket.on('disconnect', () => {
        // Remove this socket from the user's active sockets
        if (userSockets.has(currentUserId)) {
            userSockets.get(currentUserId).delete(socket.id);
            if (userSockets.get(currentUserId).size === 0) {
                userSockets.delete(currentUserId);
            }
        }
        // No explicit 'leaveChat' needed for all rooms on disconnect; Socket.IO handles room cleanup
        // for disconnected sockets automatically.
        console.log(`User ${currentUsername} (${currentUserId}) disconnected.`);
    });
};