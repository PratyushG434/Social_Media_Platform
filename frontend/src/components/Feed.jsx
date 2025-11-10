"use client"

import { useState } from "react"
import PostCard from "./PostCard"
import Stories from "./Stories"

export default function Feed({ currentUser, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const [posts] = useState([
    {
      id: 1,
      user: {
        id: 2,
        username: "sarah_wilson",
        displayName: "Sarah Wilson",
        profilePic: "/woman-profile.png",
      },
      content: "Beautiful sunset at the beach today! 🌅",
      mediaUrl: "/sunset-beach-tranquil.png",
      contentType: "image",
      timestamp: "2 hours ago",
      likes: 124,
      comments: 18,
      shares: 5,
      isLiked: false,
      isSaved: false,
    },
    {
      id: 2,
      user: {
        id: 3,
        username: "mike_photo",
        displayName: "Mike Photography",
        profilePic: "/man-photographer.png",
      },
      content: "New camera gear arrived! Time for some amazing shots 📸",
      mediaUrl: "/assorted-camera-gear.png",
      contentType: "image",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 12,
      shares: 3,
      isLiked: true,
      isSaved: false,
    },
    {
      id: 3,
      user: {
        id: 4,
        username: "foodie_anna",
        displayName: "Anna Foodie",
        profilePic: "/woman-chef-preparing-food.png",
      },
      content: "Homemade pasta with fresh basil from my garden 🍝",
      mediaUrl: "/delicious-pasta-dish.png",
      contentType: "image",
      timestamp: "6 hours ago",
      likes: 156,
      comments: 23,
      shares: 8,
      isLiked: false,
      isSaved: true,
    },
  ])

  const suggestedUsers = [
    {
      id: 5,
      username: "travel_tom",
      displayName: "Tom Explorer",
      profilePic: "/man-traveler.jpg",
      mutualFriends: 12,
      isFollowing: false,
    },
    {
      id: 6,
      username: "art_emma",
      displayName: "Emma Artist",
      profilePic: "/woman-artist.png",
      mutualFriends: 8,
      isFollowing: false,
    },
  ]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterType === "all" || (filterType === "liked" && post.isLiked) || (filterType === "saved" && post.isSaved)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header with Search */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-md border-b border-border/50 p-4 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StreamSocial
          </h1>
          <button
            onClick={() => onNavigate("settings")}
            className="p-2 hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, people..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-primary/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
          />
          <svg
            className="w-5 h-5 text-primary/60 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All Posts", icon: "📱" },
            { id: "liked", label: "Liked", icon: "❤️" },
            { id: "saved", label: "Saved", icon: "🔖" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                filterType === filter.id
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white/60 text-gray-700 hover:bg-white/80"
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stories */}
      <Stories onClick={onNavigate} />

      {/* Suggested Users */}
      <div className="bg-gradient-to-br from-white to-primary/5 m-4 rounded-2xl p-5 border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">✨</span>
            Suggested for you
          </h3>
          <button className="text-sm text-primary hover:text-primary/80 font-medium">See All</button>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.profilePic || "/placeholder.svg"}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.displayName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                  <p className="text-xs text-primary">{user.mutualFriends} mutual friends</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-5 px-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onNavigate={onNavigate} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
