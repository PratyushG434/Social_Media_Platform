const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { promisify } = require("util");

const parseCookies = promisify(cookieParser());

exports.authenticateSocket = async (socket, next) => {
  try {
    // 1. Parse cookies from the raw handshake headers
    await parseCookies(socket.handshake, null);

    // --- FIX: Change 'jwt' to 'token' to match what's set on login ---
    const token = socket.handshake.cookies.token;
    // --- END FIX ---

    if (!token) {
      return next(new Error("Authentication error: No token provided."));
    }

    // 2. Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to the socket object
    socket.user = decoded;

    next(); // Authentication successful
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication error: Token expired."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Authentication error: Invalid token."));
    }
    console.error("Socket authentication error:", error.message);
    return next(new Error("Authentication error: Unauthorized."));
  }
};
