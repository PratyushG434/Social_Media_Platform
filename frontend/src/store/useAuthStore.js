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
      set({ authUser: res.data });
      get().connectSocket();   // ✔ auto connect after refresh
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      set({ authUser: data });

      // ⭐ MOST IMPORTANT
      get().connectSocket();
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await API.logout();
      set({ authUser: null });
      get().disconnectSocket();
    } catch (error) {}
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser.user_id }, // ⭐ backend expects user_id
    });

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (online) => {
      set({ onlineUsers: online });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
