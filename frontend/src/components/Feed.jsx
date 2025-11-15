"use client"

import { useState, useEffect, useCallback } from "react"
import PostCard from "./PostCard"
import Stories from "./Stories"
import API from "../service/api"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import Avatar from "./Avatar"
import { NotificationProvider, useNotifications } from "./Notification-system"

const FeedContent = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all") 
  const { authUser } = useAuthStore()
  const navigate = useNavigate()
  const { addNotification } = useNotifications();

  const [allPosts, setAllPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // --- Data Fetching Functions ---
  const fetchPosts = useCallback(async (type) => {
    setLoadingPosts(true);
    try {
      // 'all' tab uses getHomeFeed (Following Posts)
      const apiCall = type === 'liked' ? API.getLikedPosts : API.getHomeFeed;
      const response = await apiCall();
      
      if (!response?.isSuccess) throw new Error(`Failed to fetch ${type} posts`);
      
      const postsData = response.data.posts || [];
      if (type === 'liked') {
        setLikedPosts(postsData);
      } else {
        setAllPosts(postsData);
      }
    } catch (err) {
      console.error(`Feed Fetch Error (${type}):`, err);
      addNotification({
          type: 'error',
          title: `Error Loading ${type === 'all' ? 'Feed' : 'Likes'}`,
          message: 'Could not load posts. Check network or server logs.'
      });
      if (type === 'liked') setLikedPosts([]);
      else setAllPosts([]);
      
    } finally {
      setLoadingPosts(false);
    }
  }, [addNotification]);


  // Effect to refetch posts when the filterType changes
  useEffect(() => {
    fetchPosts(filterType);
  }, [filterType, fetchPosts]); 


  // Effect for fetching suggested users
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


  // --- Like Toggle Handler (Lifted State Up) ---
  const handleLikeToggleInFeed = useCallback((postId, currentlyLiked) => {
    const updatePostInList = (postsList) => {
      return postsList.map(p => {
        if (p.post_id === postId) {
          return {
            ...p,
            user_has_liked: !p.user_has_liked,
            likes_count: p.user_has_liked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      });
    };

    setAllPosts(prev => updatePostInList(prev));

    if (currentlyLiked) {
      setLikedPosts(prev => prev.filter(p => p.post_id !== postId));
    } else {
      const newlyLikedPost = updatePostInList(allPosts).find(p => p.post_id === postId);
      if (newlyLikedPost) {
        setLikedPosts(prev => [newlyLikedPost, ...prev]);
      }
    }

    API.toggleLike(postId).catch(err => {
      console.error("Failed to sync like with server:", err);
      setAllPosts(prev => updatePostInList(prev));
      addNotification({ type: 'error', title: 'Like Failed', message: 'Could not update like status on server.' });
      if(filterType === 'liked') fetchPosts('liked'); 
    });
  }, [allPosts, fetchPosts, filterType, addNotification]);


  const handleFollow = useCallback(async (userIdToFollow, index) => {
    setSuggestedUsers(prev => prev.map((user, i) =>
      i === index ? { ...user, isFollowing: true } : user
    ));

    try {
      await API.toggleFollow({ userId: userIdToFollow });
      setSuggestedUsers(prev => prev.filter(user => user.user_id !== userIdToFollow));
    } catch (err) {
      console.error("Follow error:", err);
      setSuggestedUsers(prev => prev.map((user, i) =>
        i === index ? { ...user, isFollowing: false } : user
      ));
    }
  }, []);


  const postsToDisplay = filterType === 'liked' ? likedPosts : allPosts;
  const isFeedEmpty = !loadingPosts && postsToDisplay.length === 0;


  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header and Filter Tabs */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-md border-b border-border/50 p-4 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StreamSocial
          </h1>
        </div>
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search posts, people..." className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-primary/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300" />
          <svg className="w-5 h-5 text-primary/60 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Following", icon: "📱" },
            { id: "liked", label: "Liked", icon: "❤️" },
          ].map((filter) => (
            <button key={filter.id} onClick={() => setFilterType(filter.id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${filterType === filter.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/60 text-gray-700 hover:bg-white/80"}`}>
              <span>{filter.icon}</span><span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Stories />

      {/* Suggested Users Section */}
      <div className="bg-gradient-to-br from-white to-primary/5 m-4 rounded-2xl p-5 border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><span className="text-xl">✨</span> Suggested for you</h3>
          <button className="text-sm text-primary hover:text-primary/80 font-medium">See All</button>
        </div>
        <div className="space-y-3">
          {loadingSuggestions && <p className="text-sm text-muted-foreground">Loading suggestions...</p>}
          {!loadingSuggestions && suggestedUsers.length === 0 && <p className="text-sm text-muted-foreground">No new suggestions right now.</p>}
          {!loadingSuggestions && suggestedUsers.map((user, index) => (
            <div key={user.user_id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-all duration-300">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${user.user_id}`)}>
                <Avatar src={user.profile_pic_url} name={user.display_name || user.username} className="w-12 h-12" />
                <div>
                  <p className="font-semibold text-gray-800">{user.display_name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button onClick={() => handleFollow(user.user_id, index)} disabled={user.isFollowing} className={`text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${user.isFollowing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30'}`}>
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Posts Feed */}
      <div className="space-y-5 px-4">
        {loadingPosts && (
          <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
        )}
        
        {isFeedEmpty && (
            <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
                <div className="text-6xl mb-4">{filterType === 'liked' ? '💔' : '✨'}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {filterType === 'liked' ? 'No Liked Posts Yet' : 'Your Feed is Empty'}
                </h3>
                <p className="text-gray-500">{filterType === 'liked' ? 'Posts you like will appear here.' : 'Follow users to see their posts here!'}</p>
            </div>
        )}

        {!loadingPosts && postsToDisplay.length > 0 && (
          postsToDisplay.map((post) => (
            <PostCard
              key={post.post_id} 
              post={post} 
              onLikeToggle={handleLikeToggleInFeed} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function Feed() {
  return (
    <NotificationProvider>
      <FeedContent />
    </NotificationProvider>
  )
}