"use client"

import { useState, useEffect, useCallback } from "react"
import API from "../service/api"
import { useNotifications } from "./Notification-system" // Assuming you want toast notifications for errors

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications();

  // --- Data Fetching ---
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.getNotifications();
      if (!response?.isSuccess) throw new Error("Failed to load notifications.");
      
      // Map BE fields to FE display names if necessary, and ensure a unique key
      const processed = response.data.notifications.map(n => ({
          id: n.notification_id,
          type: n.type,
          user: {
            id: n.sender_id,
            username: n.sender_username,
            displayName: n.sender_display_name,
            profilePic: n.sender_profile_pic_url,
          },
          content: n.content,
          postPreview: n.post_media_url, // Use post_media_url for preview
          timestamp: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: n.is_read,
      }));

      setNotifications(processed);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      addNotification({ type: 'error', title: 'Loading Error', message: 'Failed to fetch notifications.' });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️"
      case "comment":
        return "💬"
      case "follow":
        return "👤"
      case "story_reaction":
        return "😍"
      case "mention":
        return "🏷️"
      default:
        return "🔔"
    }
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "likes":
        return notifications.filter((n) => n.type === "like")
      case "comments":
        return notifications.filter((n) => n.type === "comment" || n.type === "mention")
      case "follows":
        return notifications.filter((n) => n.type === "follow")
      default:
        return notifications
    }
  }

  const handleNotificationClick = (notification) => {
    // Basic Mark as Read logic (since we don't handle individual read status easily yet)
    // Here you would navigate to the post/profile/story
    console.log("Navigate to related content for:", notification);
  }

  const markAllAsRead = async () => {
    try {
        await API.markNotificationsRead();
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
        addNotification({ type: 'success', title: 'Success', message: 'All notifications marked as read.' });
    } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to mark as read.' });
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-card-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <button
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All", count: notifications.length },
            { id: "likes", label: "Likes", count: notifications.filter((n) => n.type === "like").length },
            {
              id: "comments",
              label: "Comments",
              count: notifications.filter((n) => n.type === "comment" || n.type === "mention").length,
            },
            { id: "follows", label: "Follows", count: notifications.filter((n) => n.type === "follow").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
      )}

      {/* Notifications List */}
      {!loading && (
      <div className="divide-y divide-border">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                !notification.isRead ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* User Avatar with notification icon */}
                <div className="relative">
                  <img
                    src={notification.user.profilePic || "/placeholder.svg"}
                    alt={notification.user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                    <span className="text-xs">{getNotificationIcon(notification.type)}</span>
                  </div>
                </div>

                {/* Notification content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-card-foreground">
                        <span className="font-semibold">{notification.user.displayName}</span>{" "}
                        <span className="text-muted-foreground">{notification.content}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.timestamp}</p>
                    </div>

                    {/* Post preview */}
                    {notification.postPreview && (
                      <img
                        src={notification.postPreview}
                        alt="Post preview"
                        className="w-12 h-12 rounded object-cover ml-3"
                      />
                    )}
                  </div>

                  {/* Follow button for follow notifications - Placeholder logic */}
                  {notification.type === "follow" && (
                    <button className="mt-2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm hover:bg-primary/90 transition-colors">
                      Follow Back
                    </button>
                  )}
                </div>

                {/* Unread indicator */}
                {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {activeTab === "all" ? "You're all caught up!" : `No ${activeTab} notifications yet`}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Activity suggestions (Placeholder - kept for UI filler) */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="p-4 bg-card m-4 rounded-lg border border-border">
          <h3 className="font-semibold text-card-foreground mb-3">Suggested for you</h3>
          <div className="space-y-3">
            {/* ... (mock suggestions) ... */}
          </div>
        </div>
      )}
    </div>
  )
}