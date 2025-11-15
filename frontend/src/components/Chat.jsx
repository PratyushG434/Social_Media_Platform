import React from "react";
import { useNavigate } from "react-router-dom";
import { ChatList } from "../components/chat-system/Chat-list";
import ChatWindow from "./chat-system/ChatWindow";


import { NotificationProvider } from "../components/Notification-system";


function ChatContent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen color-wave relative">
     

      {/* Main Content */}
      <div className="container mx-auto p-4 h-[calc(100vh-80px)] my-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <ChatList />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <NotificationProvider>
      <ChatContent />
    </NotificationProvider>
  );
}
