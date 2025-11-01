"use client"

import { useState } from "react"

export default function Messages({ currentUser, onNavigate }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")

  // Mock conversations with enhanced data
  const [conversations] = useState([
    {
      id: 1,
      user: {
        id: 2,
        username: "sarah_wilson",
        displayName: "Sarah Wilson",
        profilePic: "/profile.jpg",
        status: "Designer at TechCorp",
      },
      lastMessage: "Hey! How was your day?",
      timestamp: "2m ago",
      unread: 2,
      isOnline: true,
      lastSeen: "Active now",
    },
    {
      id: 2,
      user: {
        id: 3,
        username: "mike_photo",
        displayName: "Mike Photography",
        profilePic: "/profile.jpg",
        status: "Professional Photographer",
      },
      lastMessage: "Thanks for the photo tips!",
      timestamp: "1h ago",
      unread: 0,
      isOnline: false,
      lastSeen: "1 hour ago",
    },
    {
      id: 3,
      user: {
        id: 4,
        username: "foodie_anna",
        displayName: "Anna Foodie",
        profilePic: "/profile.jpg",
        status: "Food Blogger & Chef",
      },
      lastMessage: "That recipe looks amazing!",
      timestamp: "3h ago",
      unread: 1,
      isOnline: true,
      lastSeen: "Active now",
    },
    {
      id: 4,
      user: {
        id: 5,
        username: "travel_explorer",
        displayName: "Alex Explorer",
        profilePic: "/profile.jpg",
        status: "Travel Content Creator",
      },
      lastMessage: "Just posted new travel photos!",
      timestamp: "5h ago",
      unread: 0,
      isOnline: false,
      lastSeen: "3 hours ago",
    },
    {
      id: 5,
      user: {
        id: 6,
        username: "fitness_coach",
        displayName: "Emma Fitness",
        profilePic: "/profile.jpg",
        status: "Personal Trainer",
      },
      lastMessage: "Great workout session today!",
      timestamp: "1d ago",
      unread: 0,
      isOnline: true,
      lastSeen: "Active now",
    },
  ])

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        senderId: 2,
        content: "Hey! How was your day?",
        timestamp: "2:30 PM",
        isOwn: false,
        liked: false,
      },
      {
        id: 2,
        senderId: 1,
        content: "It was great! Just finished a new project",
        timestamp: "2:32 PM",
        isOwn: true,
        liked: false,
      },
      {
        id: 3,
        senderId: 2,
        content: "That sounds awesome! Can't wait to see it",
        timestamp: "2:33 PM",
        isOwn: false,
        liked: true,
      },
      {
        id: 4,
        senderId: 1,
        content: "I'll share it on my story later today",
        timestamp: "2:35 PM",
        isOwn: true,
        liked: false,
      },
    ],
    2: [
      {
        id: 1,
        senderId: 3,
        content: "Thanks for the photo tips!",
        timestamp: "1:15 PM",
        isOwn: false,
        liked: false,
      },
      {
        id: 2,
        senderId: 1,
        content: "You're welcome! Keep practicing",
        timestamp: "1:20 PM",
        isOwn: true,
        liked: false,
      },
    ],
    3: [
      {
        id: 1,
        senderId: 4,
        content: "That recipe looks amazing!",
        timestamp: "11:45 AM",
        isOwn: false,
        liked: false,
      },
    ],
    4: [
      {
        id: 1,
        senderId: 5,
        content: "Just posted new travel photos!",
        timestamp: "10:45 AM",
        isOwn: false,
        liked: false,
      },
    ],
    5: [
      {
        id: 1,
        senderId: 6,
        content: "Great workout session today!",
        timestamp: "9:45 AM",
        isOwn: false,
        liked: false,
      },
    ],
  })

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && selectedChat) {
      // Mock sending message
      setNewMessage("")
    }
  }

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation)
  }

  const handleLikeMessage = (messageId) => {
    if (!selectedChat) return

    setMessages((prevMessages) => ({
      ...prevMessages,
      [selectedChat.id]: prevMessages[selectedChat.id].map((msg) =>
        msg.id === messageId ? { ...msg, liked: !msg.liked } : msg,
      ),
    }))
  }

  return (
    <div className="max-w-7xl mx-auto h-screen flex bg-background">
      <div
        className={`${selectedChat ? "hidden lg:block" : "block"} w-full lg:w-96 bg-card border-r border-border flex flex-col`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <button className="p-3 hover:bg-primary/10 rounded-full transition-colors group">
              <span className="text-xl group-hover:scale-110 transition-transform">✏️</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</span>
          </div>
        </div>

        {/* Online Status Bar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3 overflow-x-auto">
            {conversations
              .filter((c) => c.isOnline)
              .map((conversation) => (
                <div key={conversation.id} className="flex flex-col items-center space-y-1 min-w-0">
                  <div className="relative">
                    <img
                      src={conversation.user.profilePic || "/profile.jpg"}
                      alt={conversation.user.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-16">
                    {conversation.user.displayName.split(" ")[0]}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleChatSelect(conversation)}
              className={`flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 border-l-4 ${
                selectedChat?.id === conversation.id
                  ? "bg-primary/5 border-l-primary"
                  : "border-l-transparent hover:border-l-primary/30"
              }`}
            >
              <div className="relative">
                <img
                  src={conversation.user.profilePic || "/profile.jpg"}
                  alt={conversation.user.displayName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {conversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-background"></div>
                )}
                {conversation.unread > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {conversation.unread}
                  </div>
                )}
              </div>

              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground truncate">{conversation.user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-1">{conversation.user.status}</p>
                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>
            </div>
          ))}
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
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                  >
                    <span className="text-xl">←</span>
                  </button>
                  <div className="relative">
                    <img
                      src={selectedChat.user.profilePic || "/profile.jpg"}
                      alt={selectedChat.user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {selectedChat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selectedChat.user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{selectedChat.user.status}</p>
                    <p className="text-xs text-primary">{selectedChat.lastSeen}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-3 hover:bg-muted rounded-full transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">📞</span>
                  </button>
                  <button className="p-3 hover:bg-muted rounded-full transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">📹</span>
                  </button>
                  <button className="p-3 hover:bg-muted rounded-full transition-colors group">
                    <span className="text-xl group-hover:scale-110 transition-transform">ℹ️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages[selectedChat.id]?.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div className="flex flex-col items-end max-w-xs lg:max-w-md group">
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card text-foreground rounded-bl-md border border-border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLikeMessage(message.id)}
                      className={`mt-1 px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-all ${
                        message.liked
                          ? "text-red-500 hover:text-red-600"
                          : "text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span className={`transition-transform ${message.liked ? "scale-110" : ""}`}>
                        {message.liked ? "❤️" : "🤍"}
                      </span>
                      {message.liked && <span className="font-medium">Liked</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card/80 backdrop-blur-sm border-t border-border p-6">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                <button
                  type="button"
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full"
                >
                  <span className="text-xl">📷</span>
                </button>
                <button
                  type="button"
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full"
                >
                  <span className="text-xl">📎</span>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full"
                >
                  <span className="text-xl">😊</span>
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
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
                Send private messages to friends and connect with your community
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
