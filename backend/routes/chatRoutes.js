// backend/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController'); // Import chat controller
const { protect } = require('../middleware/authMiddleware');    // Import auth middleware

// Route to create a new chat or get an existing one between two users
// POST /api/chats
router.post('/', protect, chatController.createChat);

// Route to get all chats for the authenticated user  
router.get('/', protect, chatController.getUserChats);


module.exports = router;


