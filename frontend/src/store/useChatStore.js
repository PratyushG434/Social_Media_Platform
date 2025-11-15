import { create } from "zustand";
import API from "../service/api";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // Active state
  chats: [],
  messages: [],
  selectedChat: null,

  // Loading state
  isChatsLoading: false,
  isMessagesLoading: false,
  _messageListener: null,

  // State to store user ID for initiating a chat after navigation (from profile page)
  targetUserIdForNewChat: null,

  // 1. Fetch all chats for the user (Sidebar)
  fetchUserChats: async () => {
    set({ isChatsLoading: true });
    try {
      const response = await API.getUserChats();
      if (!response.isSuccess)
        throw new Error(response.msg || "Failed to fetch chats.");

      const currentUserId = useAuthStore.getState().authUser.user_id;
      const processedChats = response.data.chats.map((chat) => {
        const partner = {
          user_id: chat.other_user_id,
          username: chat.other_username,
          display_name: chat.other_display_name,
          profile_pic_url: chat.other_profile_pic_url,
        };
        return { ...chat, partner };
      });

      set({ chats: processedChats });
    } catch (error) {
      console.error("Error fetching user chats:", error);
    } finally {
      set({ isChatsLoading: false });
    }
  },

  // 2. Select a chat and fetch its messages
  selectChat: async (chatObject) => {
    set({ selectedChat: chatObject, isMessagesLoading: true, messages: [] });

    try {
      const chatId = chatObject.chat_id;
      if (!chatId) throw new Error("Cannot fetch messages: Missing chatId.");

      const response = await API.getChatMessages(chatId);
      if (!response.isSuccess)
        throw new Error(response.msg || "Failed to fetch messages.");

      set({ messages: response.data.messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // 3. Initiate a new chat or fetch an existing one
  createOrGetChat: async (targetUserId) => {
    try {
      const response = await API.createChat({ targetUserId });
      if (!response.isSuccess)
        throw new Error(response.msg || "Failed to create/get chat.");

      const newChat = response.data.chat;

      if (!newChat || !newChat.chat_id) {
        throw new Error("Chat created but missing chat_id in response.");
      }

      const chatId = newChat.chat_id;

      // Use the raw chat ID for the detail fetch (using query param route)
      const detailResponse = await API.getChatDetails(chatId);
      if (!detailResponse.isSuccess)
        throw new Error("Failed to get chat details.");

      const fullChat = detailResponse.data.chat;

      // Add/update chat list locally
      set((state) => {
        const chatExists = state.chats.some(
          (c) => c.chat_id === fullChat.chat_id
        );
        if (!chatExists) {
          return { chats: [fullChat, ...state.chats] };
        }
        return state;
      });

      return fullChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  },

  // 4. Send message via WebSocket
  sendMessage: (content) => {
    const { selectedChat } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    if (!selectedChat || !socket || !socket.connected) {
      console.error("Socket not connected or no chat selected.");
      return;
    }

    socket.emit(
      "sendMessage",
      {
        chatId: selectedChat.chat_id,
        content: content,
      },
      (response) => {
        if (response.status === "error") {
          console.error("Server failed to send message:", response.message);
        }
      }
    );
  },

  // 5. Subscribe to WebSocket events (joining room and listening for messages)
  subscribeToChatEvents: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedChat } = get();
    if (!socket || !selectedChat) return;

    // 1. Join the room on the server
    socket.emit("joinChat", selectedChat.chat_id);

    // 2. Listen for incoming messages
    socket.on("receiveMessage", (richMessage) => {
      const currentSelectedChat = get().selectedChat;

      // Check if the message belongs to the currently selected chat
      if (
        currentSelectedChat &&
        richMessage.chat_id === currentSelectedChat.chat_id
      ) {
        set((state) => ({
          messages: [...state.messages, richMessage],
        }));
      } else {
        // Update the sidebar (e.g., fetch the chats again to update last message/unread count)
        get().fetchUserChats();
      }
    });
  },

  unsubscribeFromChatEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("receiveMessage");
      // A 'leaveChat' emit is usually redundant as sockets leave rooms on disconnect,
      // but can be added if needed for explicit cleanup.
    }
  },

  clearSelectedChat: () => {
    set({ selectedChat: null, messages: [], targetUserIdForNewChat: null });
  },

  setTargetUserForChat: (userId) => {
    set({ targetUserIdForNewChat: userId });
  },

  clearTargetUserForChat: () => {
    set({ targetUserIdForNewChat: null });
  },
}));
