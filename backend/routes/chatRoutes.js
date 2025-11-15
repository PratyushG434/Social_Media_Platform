// backend/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Route to create a new chat or get an existing one between two users
router.post("/", protect, chatController.createChat);

// Route to get all chats for the authenticated user
router.get("/", protect, chatController.getUserChats);

// --- THIS IS THE FIX ---
// Route to get specific chat details (using query parameters)
router.get("/detail", protect, chatController.getChatDetails);
// --- END FIX ---

// Route to get all messages for a specific chat
router.get("/:chatId/messages", protect, chatController.getChatMessages);

module.exports = router;
