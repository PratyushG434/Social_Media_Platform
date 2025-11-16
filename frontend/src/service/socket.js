import { io } from "socket.io-client";

const socket = io("https://social-media-platform-vpii.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],  // recommended for Render
});

export default socket;