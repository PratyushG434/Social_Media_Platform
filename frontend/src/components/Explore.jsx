"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import API from "../service/api";
import Avatar from "./Avatar";
import PostCard from "./PostCard"; // CRITICAL: Import PostCard
import { useNotifications } from "./Notification-system"; // CRITICAL: For error handling

export default function Explore() {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const { authUser } = useAuthStore();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [discoveryPosts, setDiscoveryPosts] = useState([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState(true);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [peopleList, setPeopleList] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // --- Effect 2: Debouncing Search (People Tab + Dropdown) ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await API.searchUsers({ searchQuery });

        if (response?.isSuccess) {
          setSearchResults(response.data || []);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = () => setShowSearchResults(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- Handler for PostCard (to update local state when a user likes/unlikes) ---
  const handleLikeToggleInExplore = (postId, currentlyLiked) => {
    // Optimistically update the explore posts list
    setDiscoveryPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.post_id === postId) {
          return {
            ...p,
            user_has_liked: !p.user_has_liked,
            likes_count: p.user_has_liked
              ? p.likes_count - 1
              : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    // Send API request
    API.toggleLike(postId).catch((err) => {
      console.error("Failed to sync like with server:", err);
      addNotification({
        type: "error",
        title: "Like Failed",
        message: "Could not update like status on server.",
      });
    });
  };

  // --- Effect 1: Fetch Discovery Feed when "Trending" tab is active ---
  const fetchDiscovery = useCallback(async () => {
    if (activeTab !== "trending") return;

    setLoadingDiscovery(true);
    try {
      const response = await API.getDiscoveryFeed();
      if (response.isSuccess) {
        // Ensure posts have a default user_has_liked property for PostCard compatibility
        const postsWithLikeStatus = (response.data.posts || []).map((p) => ({
          ...p,
          user_has_liked: p.user_has_liked || false,
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

  // Fetch people list (suggested users) when People tab is active
  useEffect(() => {
    const fetchPeople = async () => {
      if (activeTab !== "people") return;
      setLoadingPeople(true);
      try {
        const res = await API.getSuggestedUsers();
        if (res?.isSuccess) {
          setPeopleList(res.data || []);
        } else {
          setPeopleList([]);
        }
      } catch (err) {
        console.error("Error fetching people list:", err);
        setPeopleList([]);
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchPeople();
  }, [activeTab]);

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
        const response = await API.searchUsers({
          searchQuery: searchQuery.trim(),
        });
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

  const tabs = [
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "people", label: "People", icon: "👥" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header and Search Bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Explore</h1>
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true); // 🟢 Show dropdown as soon as user types
            }}
            placeholder="Search for people..."
            className="w-full px-6 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />

          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
            <span className="text-xl">🔍</span>
          </button>

          {/* 🔥 SEARCH DROPDOWN (Copied from Feed page) */}
          {showSearchResults && searchQuery.trim() !== "" && (
            <div
              className="absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 mt-2 rounded-xl z-50 max-h-64 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {searchLoading && (
                <p className="p-3 text-sm text-gray-500">Searching...</p>
              )}

              {!searchLoading && searchResults.length === 0 && (
                <p className="p-3 text-sm text-gray-500">No users found.</p>
              )}

              {!searchLoading &&
                searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => {
                      navigate(`/profile/${user.user_id}`);
                      setShowSearchResults(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <img
                      src={user.profile_pic_url || "/placeholder.svg"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="flex space-x-1 bg-muted p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
        <div className="max-w-2xl mx-auto">
          {loadingDiscovery && (
            <p className="text-center p-8 text-muted-foreground">
              Loading trending posts...
            </p>
          )}
          {!loadingDiscovery && discoveryPosts.length === 0 && (
            <p className="text-center p-8 text-muted-foreground">
              No discovery posts available.
            </p>
          )}

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

          {/* If user has searched, show search results */}
          {!isSearching && hasSearched && (
            <>
              {searchResults.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center">
                  No users found for "{searchQuery}"
                </p>
              )}

              {searchResults.length > 0 &&
                searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() =>
                      navigate(`/dashboard/profile/${user.user_id}`)
                    }
                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="text-center">
                      <Avatar
                        src={user.profile_pic_url}
                        name={user.display_name || user.username}
                        className="w-20 h-20 mx-auto mb-4"
                      />
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <h3 className="font-bold text-foreground">
                          {user.display_name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        @{user.username}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 truncate">
                        {user.bio || "No bio yet."}
                      </p>
                      <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* If user hasn't searched, show peopleList (suggested users) */}
          {!hasSearched && (
            <>
              {loadingPeople && (
                <p className="text-muted-foreground col-span-full text-center">
                  Loading users...
                </p>
              )}

              {!loadingPeople && peopleList.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center">
                  No users to show.
                </p>
              )}

              {!loadingPeople &&
                peopleList.length > 0 &&
                peopleList.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() =>
                      navigate(`/dashboard/profile/${user.user_id}`)
                    }
                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="text-center">
                      <Avatar
                        src={user.profile_pic_url}
                        name={user.display_name || user.username}
                        className="w-20 h-20 mx-auto mb-4"
                      />
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <h3 className="font-bold text-foreground">
                          {user.display_name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        @{user.username}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 truncate">
                        {user.bio || "No bio yet."}
                      </p>
                      <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
            </>
          )}
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
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {hashtag.tag}
                  </h3>
                  <p className="text-muted-foreground">{hashtag.posts} posts</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
