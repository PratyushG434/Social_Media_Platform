// useAuthStore.jsx
import { create } from "zustand";
import API from "../service/api";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:8000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isRegistering: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await API.checkAuth();
      if (res.isSuccess) {
        set({ authUser: res.data });
        // --- FIX: Connect socket AFTER auth is confirmed ---
        get().connectSocket();
      } else {
        set({ authUser: null });
        get().disconnectSocket(); // Disconnect if auth fails
      }
    } catch (error) {
      set({ authUser: null });
      get().disconnectSocket(); // Disconnect on error
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    // Note: The login API call happens in Login.jsx.
    // This function is for setting the state after the API call succeeds.
    set({ isLoggingIn: true });
    try {
      set({ authUser: data });
      // --- FIX: Connect socket AFTER user data is set ---
      get().connectSocket();
    } catch (error) {
      console.log("error in set authuser in useauthstore");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await API.logout();
      set({ authUser: null });
      get().disconnectSocket(); // Disconnect socket after logout
    } catch (error) {}
  },

  connectSocket: () => {
    const { authUser } = get();
    // Prevent reconnecting if already connected
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // This ensures cookies are sent with the handshake
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    set({ socket: socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
      console.log("Socket disconnected.");
    }
  },
}));
