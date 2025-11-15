"use client"

import { useState } from "react"
import API from "../service/api"
import { useNotifications } from "./Notification-system";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom" 
import Avatar from "./Avatar";

export default function PostCard({ post, onLikeToggle }) {
  const { addNotification } = useNotifications();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation(); 

  // State is derived from props (Single Source of Truth)
  const isLiked = post.user_has_liked;
  const likeCount = post.likes_count;

  // Local state for comments
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [showMenu, setShowMenu] = useState(false);

  const isPostOwner = authUser && authUser.user_id === post.user_id;
  // Determine if we are currently viewing the post detail page
  const isDetailPage = location.pathname.startsWith(`/post/${post.post_id}`);

  // Calls the handler passed from the parent (Feed.jsx or PostDetail.jsx)
  const handleToggleLike = () => {
    if (onLikeToggle) {
      onLikeToggle(post.post_id, isLiked);
    }
  };
  
  const handlePostContentClick = () => {
    // Only navigate to detail if we are NOT already on the detail page
    if (!isDetailPage) {
        navigate(`/post/${post.post_id}`);
    }
  };

    const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
        const response = await API.deletePost(post.post_id);
        
        if (!response?.isSuccess) throw new Error("Failed to delete post.");

        addNotification?.({ 
            type: "success", 
            title: "Post Deleted", 
            message: "Your post was successfully removed." 
        });

        // Redirect user if they are on the detail page, otherwise refresh the feed
        if (isDetailPage) {
            navigate('/dashboard', { replace: true });
        } else {
            // Simple force reload or local state manipulation required here 
            // In a robust app, parent component (Feed) would handle post removal from its state.
            window.location.reload(); 
        }

    } catch (err) {
        console.error("Deletion error:", err);
        addNotification?.({ 
            type: "error", 
            title: "Deletion Failed", 
            message: err.message || "Failed to delete post." 
        });
    } finally {
        setShowMenu(false);
    }
  };


  const handleToggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (commentsLoaded) return;
    try {
      setLoadingComments(true);
      const response = await API.getComments({ postId: post.post_id });
      if (!response?.isSuccess) throw new Error("Failed to load comments");
      setComments(response.data.comments || []);
      setCommentsLoaded(true);
    } catch (err) {
      console.error("Error loading comments:", err);
      addNotification?.({ type: "error", title: "Comments Error", message: "Failed to load comments." });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await API.addComment({ postId: post.post_id, content: newComment.trim() });
      if (!response?.isSuccess) throw new Error("Failed to post comment");
      
      const addedComment = { 
          ...response.data.comment, 
          username: authUser?.username, 
          display_name: authUser?.display_name, 
          profile_pic_url: authUser?.profile_pic_url 
      };
      setComments((prev) => [...prev, addedComment]);
      addNotification?.({ type: "success", title: "Comment Added!", message: "Your comment was posted successfully." });
      setNewComment("");
      setShowComments(true);
    } catch (err) {
      console.error("Error posting comment:", err);
      addNotification?.({ type: "error", title: "Comment Failed", message: err.message || "Something went wrong posting your comment." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="relative cursor-pointer" onClick={() => navigate(`/profile/${post.user_id}`)}>
            <Avatar src={post.profile_pic_url} name={post.display_name || post.username} className="w-11 h-11 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="cursor-pointer" onClick={() => navigate(`/profile/${post.user_id}`)}>
            <p className="font-bold text-gray-800 hover:text-primary transition-colors">{post.display_name || post.username}</p>
            <p className="text-xs text-gray-500">@{post.username} • {new Date(post.timestamp).toLocaleDateString()}</p>
          </div>
        </div>
        {/* --- NEW: Kebab Menu for Delete --- */}
        {isPostOwner && (
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(prev => !prev)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 4a2 2 0 104 0 2 2 0 00-4 0z"/></svg>
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border z-10">
                        <button 
                            onClick={handleDeletePost}
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-red-50 rounded-lg"
                        >
                            Delete Post
                        </button>
                    </div>
                )}
            </div>
        )}
        {/* --- END NEW --- */}

      </div>

      {/* Post Content and Media (Clickable area to go to detail) */}
      <div onClick={handlePostContentClick} className={isDetailPage ? "" : "cursor-pointer"}>
          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-gray-800 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Media (Video/Image Check) */}
          {post.media_url && (
            <div className="relative group">
              {post.content_type === 'video' ? (
                <video 
                  src={post.media_url} 
                  controls 
                  loop 
                  muted 
                  className="w-full h-auto max-h-[600px] object-cover bg-black" 
                  onClick={(e) => e.stopPropagation()} 
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={post.media_url} 
                  alt="Post content" 
                  className="w-full h-auto max-h-[600px] object-cover" 
                />
              )}
            </div>
          )}
      </div>

      {/* Actions (Likes, Comments) */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Like Button */}
            <button
              onClick={handleToggleLike} 
              className={`flex items-center gap-2 transition-all duration-300 group ${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
            >
              <svg className={`w-6 h-6 transition-transform duration-300 ${isLiked ? "scale-110" : "group-hover:scale-110"}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-semibold">{likeCount}</span>
            </button>
            {/* Comments Button */}
            <button onClick={handleToggleComments} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all duration-300 group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span className="text-sm font-semibold">{post.comments_count || 0}</span>
            </button>
          </div>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
            {loadingComments ? (
              <p className="text-gray-500 text-sm">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.comment_id} className="flex gap-3 items-start">
                  <Avatar src={c.profile_pic_url} name={c.display_name || c.username} className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{c.display_name || c.username}</p>
                    <p className="text-gray-700 text-sm">{c.content}</p>
                    <p className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
            )}
            
            {/* Add Comment Form */}
            <form onSubmit={handleComment} className="flex gap-3">
              <Avatar src={authUser?.profile_pic_url} name={authUser?.display_name || authUser?.username} className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 flex gap-2">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300" />
                <button type="submit" disabled={!newComment.trim()} className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
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