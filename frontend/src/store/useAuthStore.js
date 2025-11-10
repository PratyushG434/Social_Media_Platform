import { create } from "zustand";
import API from "../service/api";

import { io } from "socket.io-client";

const BASE_URL =  "http://localhost:8000" ;

export const useAuthStore = create((set, get) => ({
  authUser: null,
 isRegistering: false,
  isLoggingIn: false,
 isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await API.checkAuth();

      set({ authUser : res.data });


      // get().connectSocket();

    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    } 
  },


  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      
       set({ authUser: data }); // this saves the logged-in user
    console.log(get().authUser, ' from useAuthStore after setting');

    // get().connectSocket(); // if you implement sockets later
    } catch (error) {
     console.log('error in set authuser in useauthsotre')
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const response = await API.logout();
      set({ authUser: null });

   
      // get().disconnectSocket();
    } catch (error) {
   
    }
  },

 
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
