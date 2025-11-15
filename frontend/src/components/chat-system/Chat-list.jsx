"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { ScrollArea } from "../ui/Scroll-area";
import { Search } from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";

export function ChatList() {
  const { getUsers, users, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // ✅ Safety: agar users array na ho kisi reason se
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers
    .filter((user) => {
      const id = user.userID;
      return (
        (!showOnlineOnly || onlineUsers.includes(id)) &&
        (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .map((user) => {
      const id = user.userID;
      return {
        _id: id,
        username: user.username,
        avatar: user.avatar || "/profile.jpg",
        email: user.email || "",
        isOnline: onlineUsers.includes(id),
      };
    });

  return (
    <Card className="h-full glass my-5">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl mb-4">Messages</CardTitle>

        {/* Filters */}
        <div className="mt-4 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm my-2"
            />
            Show online only
          </label>
          <span className="text-xs text-muted-foreground">
            ({onlineUsers.length} online)
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass glow"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-250px)] custom-scrollbar">
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 group ${
                  selectedUser?._id === user._id
                    ? "bg-primary/10 border border-primary/20"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3 glow2 rounded-lg">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                        {user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {user.username}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-muted-foreground py-4 text-sm">
                No users found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
