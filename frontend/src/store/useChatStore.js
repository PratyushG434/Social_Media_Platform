import { create } from "zustand";

import API from "../service/api";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  newUsers: [],
  recentUsers: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

    getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await API.getUsersForSidebar();
      set({ users: res.data });
    } catch (error) {
      
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getUsersAndCategorize: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await API.getUsersForSidebar();
      const users = res.data;
      const recentUsers = [];
      const newUsers = [];

      // Loop through each user and check if they have messages
      for (const user of users) {
        try {
          const messagesRes = await API.getMessages(user.userID);
          const messages = messagesRes.data;

          if (messages.length > 0) {
            recentUsers.push(user);
          } else {
            newUsers.push(user);
          }
        } catch (error) {
          console.log(`Error fetching messages for user ${user._id}`, error);
        }
      }

      set({
        users,
        recentUsers,
        newUsers,
      });

    } catch (error) {
      console.log("Error fetching users", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      
      const res = await API.getMessages(userId);
      set({ messages: res.data });
    } catch (error) {
      // toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await API.sendMessage({
         id : selectedUser._id,
         text : messageData.text,
         image : messageData.image,
       
      })
     
     set(state => ({ messages: [...state.messages, res.data] }));
     console.log(res.data , " res from sendmessage ")
     
    } catch (error) {
      console.log(error  , " error from chat store sendmessage")
    }
  },

   subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set(state => ({
  messages: [...state.messages, newMessage],
}));

    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  
}));
