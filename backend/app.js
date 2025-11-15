require("dotenv").config();
const express = require("express");
const db = require("./db/db");
const http = require("http"); // --- NEW: Import http module ---
const { Server } = require("socket.io"); // --- NEW: Import Server from socket.io ---
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const storyRoutes = require("./routes/storyRoutes.js");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function testDbConnection() {
  try {
    const result = await db.query("SELECT NOW() AS current_db_time");
    console.log(
      "[DB Test]: Connection successful. Time from DB:",
      result.rows[0].current_db_time
    );
  } catch (error) {
    console.error(
      "[DB Test]: Connection FAILED. Check credentials and server status."
    );
    console.error("Error details:", error.message);
  }
}

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Social Media Backend API!",
    database_status: "Connected and Ready",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chats", chatRoutes);

require("./utils/cleanUpStories.js");

// --- Socket.IO Authentication and Handlers ---
const { authenticateSocket } = require("./middleware/socketAuth");
const { registerChatHandlers } = require("./socket/socketHandler");

io.use(authenticateSocket);

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id} for user ${socket.user.username}`
  );
  registerChatHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.id} for user ${socket.user.username}`
    );
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`Server is running on port: ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`======================================`);

  testDbConnection();
});
