// backend/socket/socketHandler.js

const messageService = require("../services/messageService"); // Service to interact with the database

// Optional but useful: A map to track which sockets belong to which user
// { userId: Set<socket.id>, ... }
const userSockets = new Map();

/**
 * Registers all chat-related Socket.IO event handlers for a newly connected and authenticated socket.
 * @param {object} io - The main Socket.IO server instance.
 * @param {object} socket - The specific client's socket connection.
 */
exports.registerChatHandlers = (io, socket) => {
  // User details are attached to the socket object by our `authenticateSocket` middleware
  const currentUserId = socket.user.user_id;
  const currentUsername = socket.user.username;

  // Track this new connection
  if (!userSockets.has(currentUserId)) {
    userSockets.set(currentUserId, new Set());
  }
  userSockets.get(currentUserId).add(socket.id);

  /**
   * Event: 'joinChat'
   * Client emits this when they open a chat window to join the corresponding room.
   */
  socket.on("joinChat", async (chatId, callback) => {
    const parsedChatId = parseInt(chatId);
    if (isNaN(parsedChatId)) {
      console.error(
        `User ${currentUsername} (${currentUserId}) tried to join invalid chat ID: ${chatId}`
      );
      if (callback) callback({ status: "error", message: "Invalid chat ID." });
      return;
    }

    // The core action: join the Socket.IO room. Room names are strings.
    socket.join(parsedChatId.toString());

    console.log(
      `User ${currentUsername} (Socket ID: ${socket.id}) joined chat room: ${parsedChatId}`
    );
    if (callback)
      callback({
        status: "ok",
        message: `Successfully joined chat ${parsedChatId}`,
      });
  });

  /**
   * Event: 'sendMessage'
   * Client emits this when they send a new message.
   */
  socket.on("sendMessage", async (data, callback) => {
    const { chatId, content } = data;
    const parsedChatId = parseInt(chatId);

    if (isNaN(parsedChatId) || !content || content.trim() === "") {
      if (callback)
        callback({
          status: "error",
          message: "Invalid chat ID or empty message content.",
        });
      return;
    }

    try {
      // 1. Save the message to the database using our service
      const richMessage = await messageService.sendMessage(
        parsedChatId,
        currentUserId,
        content
      );

      // 2. Broadcast the new message to all clients in that specific chat room
      // The event emitted is 'receiveMessage', which clients will listen for.
      io.to(parsedChatId.toString()).emit("receiveMessage", richMessage);

      console.log(
        `User ${currentUsername} sent message to chat ${parsedChatId}`
      );
      if (callback)
        callback({
          status: "ok",
          message: "Message sent and broadcasted.",
          sentMessage: richMessage,
        });
    } catch (error) {
      console.error(
        `Error sending message to chat ${parsedChatId} for user ${currentUsername}:`,
        error.message
      );
      if (callback) callback({ status: "error", message: error.message });
    }
  });

  /**
   * Event: 'disconnect'
   * Socket.IO's built-in event for when a client disconnects.
   */
  socket.on("disconnect", () => {
    // Clean up the disconnected socket from our tracking map
    if (userSockets.has(currentUserId)) {
      userSockets.get(currentUserId).delete(socket.id);
      if (userSockets.get(currentUserId).size === 0) {
        userSockets.delete(currentUserId);
      }
    }

    // Socket.IO automatically handles leaving all rooms on disconnect.
    console.log(
      `User ${currentUsername} (Socket ID: ${socket.id}) disconnected.`
    );
  });
};
