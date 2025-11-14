"use client"

import { useState } from "react"

export default function Notifications({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState("all")

  // Mock notifications data
  const [notifications] = useState([
    {
      id: 1,
      type: "like",
      user: {
        id: 2,
        username: "sarah_wilson",
        displayName: "Sarah Wilson",
        profilePic: "/man-photographer.png",
      },
      content: "liked your post",
      postPreview: "/vibrant-street-art.png",
      timestamp: "2m ago",
      isRead: false,
    },
    {
      id: 2,
      type: "comment",
      user: {
        id: 3,
        username: "mike_photo",
        displayName: "Mike Photography",
        profilePic: "/profile.jpg",
      },
      content: 'commented: "Amazing shot! 📸"',
      postPreview: "/vibrant-street-art.png",
      timestamp: "5m ago",
      isRead: false,
    },
    {
      id: 3,
      type: "follow",
      user: {
        id: 4,
        username: "foodie_anna",
        displayName: "Anna Foodie",
        profilePic: "/man-photographer.png",
      },
      content: "started following you",
      timestamp: "1h ago",
      isRead: true,
    },
    {
      id: 4,
      type: "story_reaction",
      user: {
        id: 5,
        username: "travel_tom",
        displayName: "Tom Explorer",
        profilePic: "/vibrant-street-art.png",
      },
      content: "reacted ❤️ to your story",
      timestamp: "2h ago",
      isRead: true,
    },
    {
      id: 5,
      type: "mention",
      user: {
        id: 6,
        username: "art_emma",
        displayName: "Emma Artist",
        profilePic: "/profile.jpg",
      },
      content: "mentioned you in a comment",
      postPreview: "/vibrant-street-art.png",
      timestamp: "3h ago",
      isRead: true,
    },
    {
      id: 6,
      type: "like",
      user: {
        id: 7,
        username: "fitness_joe",
        displayName: "Joe Fitness",
        profilePic: "/man-photographer.png",
      },
      content: "and 12 others liked your post",
      postPreview: "/vibrant-street-art.png",
      timestamp: "1d ago",
      isRead: true,
    },
  ])

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
    if (notification.type === "follow") {
      onNavigate("profile")
    } else if (notification.postPreview) {
      // Navigate to individual post
      alert("Navigate to post")
    }
  }

  const markAllAsRead = () => {
    // Mock marking all as read
    alert("All notifications marked as read")
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

      {/* Notifications List */}
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
                        src={notification.postPreview || "/placeholder.svg"}
                        alt="Post preview"
                        className="w-12 h-12 rounded object-cover ml-3"
                      />
                    )}
                  </div>

                  {/* Follow button for follow notifications */}
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

      {/* Activity suggestions */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 bg-card m-4 rounded-lg border border-border">
          <h3 className="font-semibold text-card-foreground mb-3">Suggested for you</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/vibrant-street-art.png"
                  alt="Suggested user"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-card-foreground">Alex Developer</p>
                  <p className="text-sm text-muted-foreground">Followed by sarah_wilson</p>
                </div>
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm hover:bg-primary/90 transition-colors">
                Follow
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/trending-art.jpg"
                  alt="Suggested user"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-card-foreground">Lisa Designer</p>
                  <p className="text-sm text-muted-foreground">Followed by mike_photo</p>
                </div>
              </div>
              <button className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm hover:bg-primary/90 transition-colors">
                Follow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
