"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { ScrollArea } from "../ui/Scroll-area";
import {
  Send, Paperclip, Smile, Phone, Video, Users, Search, Info, Mic, MessageCircle, X , Loader
} from "lucide-react";
import { format } from "date-fns";
import { useNotifications } from "../Notification-system";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function ChatWindow() {
  const {
    selectedUser,
    messages,
    getMessages,
    sendMessage,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const formatMessageTime = (date) => {
    return format(new Date(date), "HH:mm");
  };

  const { authUser } = useAuthStore();
  const { addNotification } = useNotifications();

  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser.chat_id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addNotification({
        type: "error",
        title: "Invalid File",
        message: "Please select an image file",
        duration: 3000
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleSendMessage = async (e) => {
  e.preventDefault();

  // Agar text bhi nahi aur image bhi nahi, ya koi user select nahi:
  if ((!newMessage.trim() && !imagePreview) || !selectedUser) return;

  try {
    await sendMessage({
      text: newMessage.trim(),
      image: imagePreview, // abhi backend sirf text/content leta hai, image support ke liye backend change chahiye
    });

    setNewMessage("");
    removeImage();
  } catch (error) {
    console.error("Failed to send message:", error);
    addNotification({
      type: "error",
      title: "Send Failed",
      message: error.message || "Could not send your message. Please try again.",
      duration: 3000,
    });
  }
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <Card className="h-full glass flex items-center justify-center breathe">
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto glow">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Welcome to StreamSocial Chat</h3>
            <p className="text-muted-foreground">
              Select a conversation to start messaging, or create a new chat to get started.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Group chats</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>Voice calls</span>
            </div>
            <div className="flex items-center space-x-1">
              <Video className="w-4 h-4" />
              <span>Video calls</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full glass my-4">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser.avatar || "/profile.jpg"} />
              <AvatarFallback>
                {selectedUser.username?.split(" ").map(s => s[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedUser.username || "Unknown"}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedUser.isOnline ? "default" : "secondary"} className="text-xs">
                  {selectedUser.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() =>
              addNotification({ type: "info", title: "Voice Call", message: `Calling ${selectedUser.username}...`, duration: 3000 })
            }>
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() =>
              addNotification({ type: "info", title: "Video Call", message: `Calling ${selectedUser.username}...`, duration: 3000 })
            }>
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Search className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-300px)] p-4 custom-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => {
              if (!message || !authUser) return null;
              const isMe = message.senderId === authUser._id;

              return (
                <div
                  ref={scrollRef}
                  key={message._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[70%]">

                    {!isMe && (
                      <div className="chat-image avatar mb-1">
                        <div className="size-8 rounded-full border">
                          <img
                            src={selectedUser?.avatar || "/profile.jpg"}
                            alt="profile pic"
                            className="rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-xl ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="rounded-md max-w-full mb-2"
                        />
                      )}
                      {message.text && (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {message.createdAt && formatMessageTime(message.createdAt)}
                      {isMe && message.isRead && <span className="ml-1">✓✓</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              placeholder={`Message ${selectedUser.username}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 glass"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !imagePreview}
          >
            <Send className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="ghost">
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-background border p-2 rounded-xl grid grid-cols-8 gap-1">
            {["😀", "😂", "😍", "👍", "🔥", "✨", "🎉", "❤️"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewMessage((prev) => prev + emoji)}
                className="text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept="image/*" />
      </div>
    </Card>
  );
}
