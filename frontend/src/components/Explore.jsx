"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom";
import API from "../service/api";
import Avatar from "./Avatar";
import PostCard from "./PostCard"; // CRITICAL: Import PostCard
import { useNotifications } from "./Notification-system"; // CRITICAL: For error handling

export default function Explore() {
  const [activeTab, setActiveTab] = useState("trending")
  const [searchQuery, setSearchQuery] = useState("")
  const { authUser } = useAuthStore();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [discoveryPosts, setDiscoveryPosts] = useState([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(true);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 

  // --- Handler for PostCard (to update local state when a user likes/unlikes) ---
  const handleLikeToggleInExplore = (postId, currentlyLiked) => {
    // Optimistically update the explore posts list
    setDiscoveryPosts(prevPosts => prevPosts.map(p => {
        if (p.post_id === postId) {
            return {
                ...p,
                user_has_liked: !p.user_has_liked,
                likes_count: p.user_has_liked ? p.likes_count - 1 : p.likes_count + 1,
            };
        }
        return p;
    }));

    // Send API request
    API.toggleLike(postId).catch(err => {
        console.error("Failed to sync like with server:", err);
        addNotification({ type: 'error', title: 'Like Failed', message: 'Could not update like status on server.' });
    });
  };

  // --- Effect 1: Fetch Discovery Feed when "Trending" tab is active ---
  const fetchDiscovery = useCallback(async () => {
    if (activeTab !== 'trending') return;

    setLoadingDiscovery(true);
    try {
      const response = await API.getDiscoveryFeed(); 
      if (response.isSuccess) {
        // Ensure posts have a default user_has_liked property for PostCard compatibility
        const postsWithLikeStatus = (response.data.posts || []).map(p => ({
            ...p,
            user_has_liked: p.user_has_liked || false 
        }));
        setDiscoveryPosts(postsWithLikeStatus);
      }
    } catch (error) {
      console.error("Discovery feed fetch error:", error);
    } finally {
      setLoadingDiscovery(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDiscovery();
  }, [fetchDiscovery]);


  // --- Effect 2: Debouncing Search (People Tab) ---
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timerId = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await API.searchUsers(searchQuery.trim());
        if (response.isSuccess) {
          setSearchResults(response.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery]);


  // Mock data (keep for other tabs if not using API yet)
  const trendingHashtags = [
    { tag: "#DigitalArt", posts: "234K" },
    { tag: "#TechTrends", posts: "189K" },
    { tag: "#FoodieLife", posts: "567K" },
  ]

  const tabs = [
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "people", label: "People", icon: "👥" },
    { id: "hashtags", label: "Hashtags", icon: "#️⃣" },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header and Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Explore</h1>
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
        <div className="flex space-x-1 bg-muted p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${activeTab === tab.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "trending" && (
        <div className="max-w-2xl mx-auto"> 
          {loadingDiscovery && <p className="text-center p-8 text-muted-foreground">Loading trending posts...</p>}
          {!loadingDiscovery && discoveryPosts.length === 0 && <p className="text-center p-8 text-muted-foreground">No discovery posts available.</p>}
          
          {/* List Style using PostCard */}
          <div className="space-y-6">
            {discoveryPosts.map((post) => (
              <PostCard
                key={post.post_id} 
                post={post} 
                onLikeToggle={handleLikeToggleInExplore}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "people" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSearching && <p className="text-muted-foreground">Searching...</p>}
          {!isSearching && hasSearched && searchResults.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center">No users found for "{searchQuery}"</p>
          )}

          {!isSearching && searchResults.length > 0 && searchResults.map((user) => (
            <div
              key={user.user_id}
              onClick={() => navigate(`/dashboard/profile/${user.user_id}`)}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="text-center">
                <Avatar
                  src={user.profile_pic_url}
                  name={user.display_name || user.username}
                  className="w-20 h-20 mx-auto mb-4"
                />
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className="font-bold text-foreground">{user.display_name}</h3>
                </div>
                <p className="text-muted-foreground mb-2">@{user.username}</p>
                <p className="text-sm text-muted-foreground mb-4 truncate">{user.bio || "No bio yet."}</p>
                <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors">
                  View Profile
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