import { create } from "zustand";
import API from "../service/api";
import { useAuthStore } from "./useAuthStore";

export const useMeetingChatStore = create((set, get) => ({
  meeting: null,               // current meeting object
  messages: [],                // chat messages (array)
  participants: [],            // list of participants
  isLoadingMeeting: false,
  isSendingMessage: false,
  isCreatingMeeting: false,

   // ✅ Create meeting
  createMeeting: async ({ title, type = "group" , meetingId }) => {
    set({ isCreatingMeeting: true });
    try {
      
      const res = await API.createMeeting({  meetingId , title,type});
      set({
        meeting: res.data,
        messages: res.data.chatMessages || [],
        participants: res.data.participants || [],
      });
      return res.data;  // useful for navigation
    } catch (error) {
      console.error("Error in createMeeting:", error);
      throw error;
    } finally {
      set({ isCreatingMeeting: false });
    }
  },


  // ✅ Fetch meeting details by ID (with messages, participants, etc.)
  fetchMeetingById: async (meetingId) => {
    set({ isLoadingMeeting: true });
    try {
      const res = await API.getMeetingById(meetingId);
      set({
        meeting: res.data,
        messages: res.data.chatMessages || [],
        participants: res.data.participants || [],
      });
    } catch (error) {
      console.log("Error in fetchMeetingById:", error);
    } finally {
      set({ isLoadingMeeting: false });
    }
  },

  // ✅ Add participant (backend will use current user from token)
  addParticipant: async (meetingId) => {
    try {
      const res = await API.addParticipant(meetingId);
      set({ participants: res.data.participants });
    } catch (error) {
      console.error("Error in addParticipant:", error);
    }
  },
   addleaveTime: async (meetingId) => {
    try {
      const res = await API.addleaveTime(meetingId);
      
    } catch (error) {
      console.error("Error in addleaveTime:", error);
    }
  },

  // ✅ Send chat message
  sendMeetingMessage: async (meetingId, message) => {
    set({ isSendingMessage: true });
    try {
      const res = await API.addMessage({meetingId, message});
      set((state) => ({
        messages: [...state.messages, res.data], // backend returns the added message
      }));

      // Emit to other participants
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("send-meeting-message", {
        meetingId,
        message: res.data.message,
        sender:res.data.sender,
      });
    }
    } catch (error) {
      console.error("Error in sendMeetingMessage:", error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // ✅ Add emotion
  addEmotion: async (meetingId, emoji) => {
    try {
      const res = await API.addEmotion({meetingId, emoji});
      set((state) => ({
        meeting: {
          ...state.meeting,
          emotionAnalytics: {
            ...state.meeting?.emotionAnalytics,
            topEmotions: res.data.topEmotions,
            totalEmotions: (state.meeting?.emotionAnalytics?.totalEmotions || 0) + 1,
          },
        },
      }));
    } catch (error) {
      console.error("Error in addEmotion:", error);
    }
  },

  // ✅ Socket: Listen for new messages
  subscribeToMeetingMessages: (meetingId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.emit("joinMeetingRoom", meetingId);
    socket.on("receive-meeting-message", (newMessage) => {
      if (newMessage?.meetingId !== meetingId) return;
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  // ✅ Socket: Unsubscribe
  unsubscribeFromMeetingMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("receive-meeting-message");
  },

  // ✅ Clear meeting data
  clearMeetingData: () => {
    set({
      meeting: null,
      messages: [],
      participants: [],
    });
  },
}));
