// backend/middleware/socketAuth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser'); // For parsing cookies from raw headers
const { promisify } = require('util'); // For using cookie-parser as a promise

// Wrap cookie-parser for use in async middleware
const parseCookies = promisify(cookieParser());

exports.authenticateSocket = async (socket, next) => {
    try {
        // 1. Parse cookies from the raw handshake headers
        // socket.handshake.headers.cookie contains the raw cookie string
        await parseCookies(socket.handshake, null); // req, res style arguments
        const token = socket.handshake.cookies.jwt; // Access the parsed 'jwt' cookie

        if (!token) {
            return next(new Error('Authentication error: No token provided.'));
        }

        // 2. Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user info to the socket object
        // This makes socket.user available in subsequent Socket.IO handlers
        socket.user = decoded; // { user_id: ..., username: ..., iat: ..., exp: ... }

        next(); // Authentication successful, proceed with connection

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new Error('Authentication error: Token expired.'));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new Error('Authentication error: Invalid token.'));
        }
        console.error('Socket authentication error:', error.message);
        return next(new Error('Authentication error: Unauthorized.'));
    }
};