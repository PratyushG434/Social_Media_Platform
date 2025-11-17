const chatService = require("../services/chatService");
const messageService = require("../services/messageService");
const userService = require("../services/userService");

exports.createChat = async (req, res) => {
  const requesterId = req.user.user_id;
  const { targetUserId } = req.body;

  if (!targetUserId || isNaN(parseInt(targetUserId))) {
    return res.status(400).json({ message: "Valid targetUserId is required." });
  }
  const parsedTargetUserId = parseInt(targetUserId);

  try {
    const { chat, created } = await chatService.createOrGetChat(
      requesterId,
      parsedTargetUserId
    );

    res.status(created ? 201 : 200).json({
      message: created
        ? "Chat created successfully!"
        : "Chat already exists, returning existing chat.",
      chat: chat,
    });
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    if (error.message === "Cannot start a chat with yourself.") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error processing chat request." });
  }
};

exports.getUserChats = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const chats = await chatService.getUserChats(userId);

    res.status(200).json({
      message: "User chats fetched successfully!",
      chats: chats,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ message: "Server error fetching user chats." });
  }
};

exports.getChatDetails = async (req, res) => {
  const currentUserId = req.user.user_id;
  const { chatId } = req.query; // Reads from query param

  if (!chatId) {
    return res
      .status(400)
      .json({ message: "Chat ID required in query parameters." });
  }

  try {
    const parsedChatId = parseInt(chatId);
    if (isNaN(parsedChatId)) {
      return res.status(400).json({ message: "Invalid Chat ID format." });
    }

    const chat = await chatService.getChatById(parsedChatId, currentUserId);
    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or user is not a participant." });
    }

    const partnerId =
      chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
    const partner = await userService.getUserById(partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Partner user not found." });
    }

    res.status(200).json({
      message: "Chat details fetched successfully!",
      chat: {
        chat_id: chat.chat_id,
        partner: {
          user_id: partner.user_id,
          username: partner.username,
          display_name: partner.display_name,
          profile_pic_url: partner.profile_pic_url,
        },
        created_at: chat.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching chat details:", error);
    res.status(500).json({ message: "Server error fetching chat details." });
  }
};

exports.getChatMessages = async (req, res) => {
  const currentUserId = req.user.user_id;
  const { chatId } = req.params;

  try {
    const messages = await messageService.getChatMessages(
      parseInt(chatId),
      currentUserId
    );

    res.status(200).json({
      message: "Chat messages fetched successfully!",
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    if (error.message === "Chat not found or user is not a participant.") {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error fetching chat messages." });
  }
};

exports.deleteMessage = async (req, res) => {
  const userId = req.user.user_id;
  const { messageId } = req.params;
  if (!messageId) {
    return res.status(400).json({ message: "Message ID required." });
  }
  try {
    await messageService.deleteMessage(parseInt(messageId), userId);
    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    if (error.message === "Message not found.") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Not authorized to delete this message.") {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error deleting message." });
  }
};
