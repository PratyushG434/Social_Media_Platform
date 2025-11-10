"use client"

import { useState } from "react"

export default function PostCard({ post, currentUser, onNavigate }) {
  const normalizedPost = {
    id: post.post_id,
    content: post.content,
    mediaUrl: post.media_url,
    timestamp: post.timestamp,
    user: {
      username: post.username,
      displayName: post.display_name || post.username,
      profilePic: post.profile_pic_url,
    },
    likes: post.likes_count,
    comments: post.comments_count,
    isLiked: post.isLiked || false,
    isSaved: post.isSaved || false,
  }
  
  const [isLiked, setIsLiked] = useState(normalizedPost.isLiked)
  const [isSaved, setIsSaved] = useState(normalizedPost.isSaved)
  const [likeCount, setLikeCount] = useState(normalizedPost.likes)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  
  
  const [comments] = useState([
    {
      id: 1,
      user: { username: "alex_dev", displayName: "Alex Developer", profilePic: "/man-profile.png" },
      content: "Amazing shot! 📸",
      timestamp: "1h ago",
      likes: 5,
    },
    {
      id: 2,
      user: { username: "lisa_design", displayName: "Lisa Designer", profilePic: "/woman-profile.png" },
      content: "Love the colors in this!",
      timestamp: "30m ago",
      likes: 3,
    },
  ])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      setNewComment("")
      setShowComments(true)
    }
  }

  const handleShare = (platform) => {
    alert(`Sharing to ${platform}`)
    setShowShareMenu(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={normalizedPost.user.profilePic || "/placeholder.svg"}
              alt={normalizedPost.user.displayName}
              className="w-11 h-11 rounded-full object-cover cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
              onClick={() => onNavigate("profile")}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div>
            <p className="font-bold text-gray-800 cursor-pointer hover:text-primary transition-colors">
              {normalizedPost.user.displayName}
            </p>
            <p className="text-xs text-gray-500">
              @{normalizedPost.user.username} • {normalizedPost.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFollowing && (
            <button
              onClick={() => setIsFollowing(true)}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-all duration-300"
            >
              Follow
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{normalizedPost.content}</p>
      </div>

      {/* Post Media */}
      {normalizedPost.mediaUrl && (
        <div className="relative group">
          <img
            src={normalizedPost.mediaUrl}
            alt="Post content"
            className="w-full h-96 object-cover cursor-pointer"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-5">

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all duration-300 group ${
                isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${isLiked ? "scale-110" : "group-hover:scale-110"}`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-semibold">{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all duration-300 group"
            >
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-semibold">{normalizedPost.comments}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`transition-all duration-300 ${
              isSaved ? "text-primary scale-110" : "text-gray-600 hover:text-primary hover:scale-110"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
            <p className="text-gray-500 text-sm">Comments loading from backend soon...</p>

            <form onSubmit={handleComment} className="flex gap-3">
              <img
                src={currentUser?.profilePic || "/placeholder.svg"}
                alt="You"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                />

                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}