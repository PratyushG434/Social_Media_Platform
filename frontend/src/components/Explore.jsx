"use client"

import { useState } from "react"

export default function Explore({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState("trending")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock trending content
  const trendingPosts = [
    {
      id: 1,
      type: "image",
      thumbnail: "/trending-art.jpg",
      likes: 1234,
      comments: 89,
      user: { username: "artist_jane", profilePic: "/placeholder.svg?key=jane" },
    },
    {
      id: 2,
      type: "video",
      thumbnail: "/cooking-video-scene.png",
      likes: 2156,
      comments: 234,
      duration: "2:34",
      user: { username: "chef_mike", profilePic: "/placeholder.svg?key=chef" },
    },
    {
      id: 3,
      type: "image",
      thumbnail: "/nature-photography-collection.png",
      likes: 987,
      comments: 45,
      user: { username: "nature_lover", profilePic: "/placeholder.svg?key=nature" },
    },
    {
      id: 4,
      type: "video",
      thumbnail: "/vibrant-dance-performance.png",
      likes: 3421,
      comments: 567,
      duration: "1:45",
      user: { username: "dancer_pro", profilePic: "/placeholder.svg?key=dancer" },
    },
    {
      id: 5,
      type: "image",
      thumbnail: "/vibrant-street-art.png",
      likes: 756,
      comments: 23,
      user: { username: "street_artist", profilePic: "/placeholder.svg?key=street" },
    },
    {
      id: 6,
      type: "video",
      thumbnail: "/tech-review-setup.png",
      likes: 1876,
      comments: 134,
      duration: "5:12",
      user: { username: "tech_guru", profilePic: "/placeholder.svg?key=tech" },
    },
  ]

  // Mock suggested users
  const suggestedUsers = [
    {
      id: 1,
      username: "creative_soul",
      displayName: "Creative Soul",
      profilePic: "/man-photographer.png",
      followers: "12.5K",
      isVerified: true,
      category: "Art & Design",
    },
    {
      id: 2,
      username: "travel_explorer",
      displayName: "Travel Explorer",
      profilePic: "/profile.jpg",
      followers: "8.9K",
      isVerified: false,
      category: "Travel",
    },
    {
      id: 3,
      username: "fitness_coach",
      displayName: "Fitness Coach",
      profilePic: "/profile.jpg",
      followers: "25.3K",
      isVerified: true,
      category: "Health & Fitness",
    },
  ]

  // Mock trending hashtags
  const trendingHashtags = [
    { tag: "#DigitalArt", posts: "234K" },
    { tag: "#TechTrends", posts: "189K" },
    { tag: "#FoodieLife", posts: "567K" },
    { tag: "#NaturePhotography", posts: "123K" },
    { tag: "#CreativeProcess", posts: "89K" },
  ]

  const tabs = [
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "people", label: "People", icon: "👥" },
    { id: "hashtags", label: "Hashtags", icon: "#️⃣" },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Explore</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for posts, people, or hashtags..."
            className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
            <span className="text-xl">🔍</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === tab.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "trending" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingPosts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square bg-card rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <img
                src={post.thumbnail || "/placeholder.svg"}
                alt="Trending post"
                className="w-full h-full object-cover"
              />

              {/* Video duration overlay */}
              {post.type === "video" && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                  {post.duration}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center space-x-1">
                    <span>❤️</span>
                    <span className="font-medium">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
              </div>

              {/* User info */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                <img
                  src={post.user.profilePic || "/placeholder.svg"}
                  alt={post.user.username}
                  className="w-6 h-6 rounded-full border-2 border-white"
                />
                <span className="text-white text-sm font-medium">@{post.user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "people" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-center">
                <img
                  src={user.profilePic || "/placeholder.svg"}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className="font-bold text-foreground">{user.displayName}</h3>
                  {user.isVerified && <span className="text-primary">✓</span>}
                </div>
                <p className="text-muted-foreground mb-2">@{user.username}</p>
                <p className="text-sm text-muted-foreground mb-3">{user.category}</p>
                <p className="text-sm font-medium text-foreground mb-4">{user.followers} followers</p>
                <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "hashtags" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingHashtags.map((hashtag, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2">{hashtag.tag}</h3>
                  <p className="text-muted-foreground">{hashtag.posts} posts</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
