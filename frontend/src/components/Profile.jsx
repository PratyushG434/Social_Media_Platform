"use client"

import { useState } from "react"

export default function Profile({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState("posts")
  const [isFollowing, setIsFollowing] = useState(false)

  // Mock user posts
  const [userPosts] = useState([
    {
      id: 1,
      mediaUrl: "/man-photographer.png",
      likes: 45,
      comments: 12,
    },
    {
      id: 2,
      mediaUrl: "/nature-photography-collection.png",
      likes: 67,
      comments: 8,
    },
    {
      id: 3,
      mediaUrl: "/nature-photography-collection.png",
      likes: 89,
      comments: 15,
    },
    {
      id: 4,
      mediaUrl: "/nature-photography-collection.png",
      likes: 23,
      comments: 5,
    },
    {
      id: 5,
      mediaUrl: "/sunset-beach-tranquil.png",
      likes: 56,
      comments: 9,
    },
    {
      id: 6,
      mediaUrl: "/sunset-beach-tranquil.png",
      likes: 78,
      comments: 18,
    },
  ])

  // Mock story highlights
  const [highlights] = useState([
    { id: 1, title: "Travel", thumbnail: "/sunset-beach-tranquil.png" },
    { id: 2, title: "Food", thumbnail: "/nature-photography-collection.png" },
    { id: 3, title: "Work", thumbnail: "/man-photographer.png" },
  ])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("dashboard")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-semibold text-card-foreground">@{currentUser?.username}</h1>
          <button
            onClick={() => onNavigate("settings")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start space-x-4 mb-6">
          <img
            src={currentUser?.profilePic || "/placeholder.svg?height=80&width=80&query=user+profile"}
            alt={currentUser?.displayName}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-card-foreground">{currentUser?.displayName}</h2>
            <p className="text-muted-foreground mb-3">{currentUser?.bio}</p>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-card-foreground">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <button className="text-center">
                <p className="font-bold text-card-foreground">{currentUser?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>
              <button className="text-center">
                <p className="font-bold text-card-foreground">{currentUser?.following || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onNavigate("settings")}
                className="flex-1 bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Edit Profile
              </button>
              <button className="bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Story Highlights */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {highlights.map((highlight) => (
              <div key={highlight.id} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 mb-2">
                  <img
                    src={highlight.thumbnail || "/placeholder.svg"}
                    alt={highlight.title}
                    className="w-full h-full rounded-full object-cover bg-background p-0.5"
                  />
                </div>
                <p className="text-xs text-card-foreground">{highlight.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "posts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <span className="text-lg mr-2">📱</span>
              Posts
            </button>
            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "tagged"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <span className="text-lg mr-2">🏷️</span>
              Tagged
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map((post) => (
              <div key={post.id} className="relative aspect-square group cursor-pointer">
                <img src={post.mediaUrl || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <span>❤️</span>
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💬</span>
                      <span className="text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-muted-foreground">No tagged posts yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
