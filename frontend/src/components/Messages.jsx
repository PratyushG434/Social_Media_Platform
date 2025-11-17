// src/components/Messages.jsx

"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"
import Avatar from "./Avatar"
import { Loader } from "lucide-react"
import { useNotifications } from "./Notification-system" 

export default function Messages() {
  const navigate = useNavigate() ;
  const { authUser } = useAuthStore();
  const { addNotification } = useNotifications(); 

  const { 
    chats, 
    messages, 
    selectedChat, 
    isChatsLoading, 
    isMessagesLoading,
    fetchUserChats,
    selectChat,
    sendMessage,
    subscribeToChatEvents,
    unsubscribeFromChatEvents,
    clearSelectedChat,
    targetUserIdForNewChat, 
    clearTargetUserForChat, 
    createOrGetChat,        
  } = useChatStore();

  const [newMessageContent, setNewMessageContent] = useState("")

  // 1. Initial Load and Chat Initiation Logic (Runs once on component mount)
  useEffect(() => {
    const initializeChatView = async () => {
        
        // Always fetch chats first to populate the sidebar
        await fetchUserChats();

        if (targetUserIdForNewChat) {
            try {
                // 1. Attempt to create or get the chat
                const newChat = await createOrGetChat(targetUserIdForNewChat);
                
                // 2. Select the chat
                if (newChat) {
                    // This call will trigger useEffect(2) below to subscribe/join the room
                    selectChat(newChat); 
                }
            } catch (error) {
                addNotification({
                    type: 'error',
                    title: 'Chat Error',
                    message: error.message || "Failed to start chat."
                });
            } finally {
                // 3. Clear the temporary state
                clearTargetUserForChat();
            }
        }
    };
    
    initializeChatView();
  }, [fetchUserChats, targetUserIdForNewChat, createOrGetChat, selectChat, clearTargetUserForChat, addNotification]);

  // 2. Handle Chat Selection (Subscribe/Unsubscribe to Socket Room)
  useEffect(() => {
    if (selectedChat) {
      subscribeToChatEvents();
    } 
    
    // Cleanup on component unmount or chat deselect
    return () => {
        unsubscribeFromChatEvents();
    };
  }, [selectedChat, subscribeToChatEvents, unsubscribeFromChatEvents]);


  const handleChatSelect = (chat) => {
    if (selectedChat?.chat_id === chat.chat_id) return;
    selectChat(chat);
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    const content = newMessageContent.trim();
    if (content && selectedChat) {
      sendMessage(content);
      setNewMessageContent("");
    }
  }
  
  const isOwnMessage = (senderId) => senderId === authUser?.user_id; // Check authUser is safe

  return (
    <div className="max-w-7xl mx-auto h-screen flex bg-background">
      <div
        className={`${selectedChat ? "hidden lg:block" : "block"} w-full lg:w-96 bg-card border-r border-border flex flex-col`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            {/* <button className="p-3 hover:bg-primary/10 rounded-full transition-colors group">
              <span className="text-xl group-hover:scale-110 transition-transform">✏️</span>
            </button> */}
          </div>
          {/* Search/Online Status Bar (Placeholder) */}
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isChatsLoading ? (
            <div className="p-4 text-center">
              <Loader className="size-6 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-2">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No active conversations.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chat_id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedChat?.chat_id === chat.chat_id
                    ? "bg-primary/5 border-l-primary"
                    : "border-l-transparent hover:border-l-primary/30"
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={chat.partner.profile_pic_url}
                    name={chat.partner.display_name || chat.partner.username}
                    className="w-14 h-14"
                  />
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground truncate">{chat.partner.display_name || chat.partner.username}</p>
                    <p className="text-xs text-muted-foreground">{}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">Conversation started.</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`${selectedChat ? "block" : "hidden lg:block"} flex-1 flex flex-col bg-gradient-to-br from-background to-muted/20`}
      >
        {selectedChat ? (
          <>
            <div className="bg-card/80 backdrop-blur-sm border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={clearSelectedChat}
                    className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                  >
                    <span className="text-xl">←</span>
                  </button>
                  <Avatar
                    src={selectedChat.partner.profile_pic_url}
                    name={selectedChat.partner.display_name || selectedChat.partner.username}
                    className="w-12 h-12"
                  />
                  <div>
                    <p className="font-bold text-foreground">{selectedChat.partner.display_name || selectedChat.partner.username}</p>
                    <p className="text-sm text-muted-foreground">@{selectedChat.partner.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* ... (Video/Call buttons placeholder) ... */}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isMessagesLoading ? (
                <div className="text-center py-12">
                  <Loader className="size-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground mt-2">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Start a conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.message_id} className={`flex ${isOwnMessage(message.sender_id) ? "justify-end" : "justify-start"}`}>
                    <div className="flex flex-col max-w-xs lg:max-w-md group relative">
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isOwnMessage(message.sender_id)
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card text-foreground rounded-bl-md border border-border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isOwnMessage(message.sender_id) ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isOwnMessage(message.sender_id) && (
                          <button
                            className="absolute top-2 right-2 z-10 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100"
                            title="Delete message"
                            onClick={async () => {
                              try {
                                await useChatStore.getState().deleteMessage(message.message_id);
                                addNotification({
                                  type: "success",
                                  title: "Message Deleted",
                                  message: "Message deleted successfully.",
                                  duration: 2000,
                                });
                              } catch (err) {
                                addNotification({
                                  type: "error",
                                  title: "Delete Failed",
                                  message: err.message || "Could not delete message.",
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            <span className="text-red-500 text-lg">×</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-card/80 backdrop-blur-sm border-t border-border p-6">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={!newMessageContent.trim()}
                  className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <span className="text-lg">➤</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-6">💬</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Your Messages</h2>
              <p className="text-muted-foreground text-lg">
                Select a chat to start connecting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}