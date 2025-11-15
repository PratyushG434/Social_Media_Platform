// useChatStore.jsx
import { create } from "zustand";
import API from "../service/api";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  _messageListener: null,

  // GET LIST OF CHATS
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await API.getUserChats();

      const users = Array.isArray(res.data) ? res.data : [];
      set({ users });
    } catch {
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // GET MESSAGES BY chat_id
  getMessages: async (chat_id) => {
    set({ isMessagesLoading: true });
    try {
      const res = await API.getMessages(chat_id);
      set({ messages: res.data });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // SEND MESSAGE USING SOCKET
  sendMessage: (messageData) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    return new Promise((resolve, reject) => {
      if (!selectedUser) return reject("No chat selected.");
      if (!socket) return reject("Socket not connected.");

      socket.emit(
        "sendMessage",
        {
          chatId: selectedUser.chat_id,   // ⭐ backend wants chat_id
          content: messageData.text,
        },
        (res) => {
          if (!res) return reject("No server response.");
          if (res.status === "ok") {
            set((st) => ({
              messages: [...st.messages, res.richMessage],
            }));
            return resolve(res.richMessage);
          }
          reject(res.message);
        }
      );
    });
  },

  // JOIN CHAT ROOM + LISTEN
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Join room
    socket.emit("joinChat", selectedUser.chat_id);

    // Listener
    const handler = (msg) => {
      const msgChat = msg.chat_id ?? msg.chatId;
      if (msgChat !== selectedUser.chat_id) return;

      set((st) => ({
        messages: [...st.messages, msg],
      }));
    };

    socket.on("receiveMessage", handler);
    set({ _messageListener: handler });
  },

  // REMOVE OLD LISTENER
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { _messageListener } = get();

    if (socket && _messageListener) {
      socket.off("receiveMessage", _messageListener);
      set({ _messageListener: null });
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));
