"use client"

import { useState } from "react"

export default function PostCard({ post, currentUser, onNavigate }) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [likeCount, setLikeCount] = useState(post.likes)
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
              src={post.user.profilePic || "/placeholder.svg"}
              alt={post.user.displayName}
              className="w-11 h-11 rounded-full object-cover cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
              onClick={() => onNavigate("profile")}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <p className="font-bold text-gray-800 cursor-pointer hover:text-primary transition-colors">
              {post.user.displayName}
            </p>
            <p className="text-xs text-gray-500">
              @{post.user.username} • {post.timestamp}
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
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="relative group">
          <img
            src={post.mediaUrl || "/placeholder.svg"}
            alt="Post content"
            className="w-full h-96 object-cover cursor-pointer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        {/* Action Buttons */}
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
              <span className="text-sm font-semibold">{post.comments}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-sm font-semibold">{post.shares}</span>
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-10 min-w-[160px]">
                  {["Copy Link", "Twitter", "Facebook", "WhatsApp"].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img
                    src={comment.user.profilePic || "/placeholder.svg"}
                    alt={comment.user.displayName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5">
                    <p className="text-sm font-semibold text-gray-800">{comment.user.displayName}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{comment.timestamp}</span>
                      <button className="hover:text-primary font-medium">Like ({comment.likes})</button>
                      <button className="hover:text-primary font-medium">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
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
                  className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
