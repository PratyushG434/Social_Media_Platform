"use client"

import { useState, useEffect, useCallback } from "react"
import PostCard from "./PostCard"
import Stories from "./Stories"
import API from "../service/api"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import Avatar from "./Avatar"
import { NotificationProvider } from "./Notification-system"

const FeedContent = () => { // We wrap the main content in a new component to use the context
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const { authUser } = useAuthStore()
  const navigate = useNavigate()

  const [allPosts, setAllPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const fetchAllPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const response = await API.getAllPosts();
      if (!response?.isSuccess) throw new Error("Failed to fetch posts");
      setAllPosts(response.data.posts || []);
    } catch (err) {
      console.log("Feed Fetch Error:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchLikedPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const response = await API.getLikedPosts();
      if (!response?.isSuccess) throw new Error("Failed to fetch liked posts");
      setLikedPosts(response.data.posts || []);
    } catch (err) {
      console.log("Liked Posts Fetch Error:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  useEffect(() => {
    const getSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await API.getSuggestedUsers();
        if (response.isSuccess) {
          setSuggestedUsers(response.data.map(user => ({ ...user, isFollowing: false })));
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    getSuggestions();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      if (allPosts.length === 0 && !loadingPosts) fetchAllPosts();
    } else if (filterType === 'liked') {
      if (likedPosts.length === 0 && !loadingPosts) fetchLikedPosts();
    }
  }, [filterType, allPosts.length, likedPosts.length, fetchAllPosts, fetchLikedPosts, loadingPosts]);

  // FIX: This is the correct variable to use for rendering
  const postsToDisplay = filterType === 'liked' ? likedPosts : allPosts;

  const handleFollow = async (userIdToFollow, index) => {
    const newSuggestedUsers = [...suggestedUsers];
    newSuggestedUsers[index].isFollowing = true;
    setSuggestedUsers(newSuggestedUsers);
    try {
      await API.toggleFollow({ userId: userIdToFollow });
    } catch (err) {
      console.error("Follow error:", err);
      const revertedUsers = [...suggestedUsers];
      revertedUsers[index].isFollowing = false;
      setSuggestedUsers(revertedUsers);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header with Search */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-md border-b border-border/50 p-4 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StreamSocial
          </h1>
        </div>
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
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "All Posts", icon: "📱" },
            { id: "liked", label: "Liked", icon: "❤️" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filterType === filter.id
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

      <Stories />

      {/* Suggested Users */}
      <div className="bg-gradient-to-br from-white to-primary/5 m-4 rounded-2xl p-5 border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">✨</span> Suggested for you
          </h3>
          <button className="text-sm text-primary hover:text-primary/80 font-medium">See All</button>
        </div>
        <div className="space-y-3">
          {loadingSuggestions && <p className="text-sm text-muted-foreground">Loading suggestions...</p>}
          {!loadingSuggestions && suggestedUsers.length === 0 && <p className="text-sm text-muted-foreground">No new suggestions right now.</p>}
          {!loadingSuggestions && suggestedUsers.map((user, index) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300"
            >
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate(`/profile/${user.user_id}`)}
              >
                <Avatar
                  src={user.profile_pic_url}
                  name={user.display_name || user.username}
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.display_name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(user.user_id, index)}
                disabled={user.isFollowing}
                className={`text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${user.isFollowing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30'
                  }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-5 px-4">
        {loadingPosts ? (
          <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
        ) : postsToDisplay.length > 0 ? (
          // FIX: Render from `postsToDisplay` and use the correct `post.post_id` key
          postsToDisplay.map((post) => (
            <PostCard key={post.post_id} post={post} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-500">This feed is empty. Try following more people!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// FIX: Create a wrapper component that provides the Notification context
export default function Feed() {
  return (
    <NotificationProvider>
      <FeedContent />
    </NotificationProvider>
  )
}