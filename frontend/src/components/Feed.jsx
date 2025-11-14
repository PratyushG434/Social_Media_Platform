"use client"

import { useState } from "react"
import PostCard from "./PostCard"
import Stories from "./Stories"
import { useEffect } from "react"
import API from "../service/api"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import Avatar from "./Avatar"

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [posts, setPosts] = useState([])
  const { authUser } = useAuthStore();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await API.getAllPosts()

        if (!response?.isSuccess) throw new Error("Failed to fetch posts")

        setPosts(response.data.posts || [])
      } catch (err) {
        console.log("Feed Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }

    getPosts()
  }, [])

  useEffect(() => {
    const getSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await API.getSuggestedUsers();
        if (response.isSuccess) {
          // Add a 'isFollowing' property for UI state management
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

    const handleFollow = async (userIdToFollow, index) => {
    // Optimistically update the UI
    const newSuggestedUsers = [...suggestedUsers];
    newSuggestedUsers[index].isFollowing = true;
    setSuggestedUsers(newSuggestedUsers);

    try {
      await API.toggleFollow({ userId: userIdToFollow });
      // In a real app, you might want to remove the user from suggestions after following
      // For now, we'll just leave the button in a "Following" state.
    } catch (err) {
      console.error("Follow error:", err);
      // Revert UI on error
      const revertedUsers = [...suggestedUsers];
      revertedUsers[index].isFollowing = false;
      setSuggestedUsers(revertedUsers);
    }
  };

  // const [posts] = useState([
  //   {
  //     id: 1,
  //     user: {
  //       id: 2,
  //       username: "sarah_wilson",
  //       displayName: "Sarah Wilson",
  //       profilePic: "/woman-profile.png",
  //     },
  //     content: "Beautiful sunset at the beach today! 🌅",
  //     mediaUrl: "/sunset-beach-tranquil.png",
  //     contentType: "image",
  //     timestamp: "2 hours ago",
  //     likes: 124,
  //     comments: 18,
  //     shares: 5,
  //     isLiked: false,
  //     isSaved: false,
  //   },
  //   {
  //     id: 2,
  //     user: {
  //       id: 3,
  //       username: "mike_photo",
  //       displayName: "Mike Photography",
  //       profilePic: "/man-photographer.png",
  //     },
  //     content: "New camera gear arrived! Time for some amazing shots 📸",
  //     mediaUrl: "/assorted-camera-gear.png",
  //     contentType: "image",
  //     timestamp: "4 hours ago",
  //     likes: 89,
  //     comments: 12,
  //     shares: 3,
  //     isLiked: true,
  //     isSaved: false,
  //   },
  //   {
  //     id: 3,
  //     user: {
  //       id: 4,
  //       username: "foodie_anna",
  //       displayName: "Anna Foodie",
  //       profilePic: "/woman-chef-preparing-food.png",
  //     },
  //     content: "Homemade pasta with fresh basil from my garden 🍝",
  //     mediaUrl: "/delicious-pasta-dish.png",
  //     contentType: "image",
  //     timestamp: "6 hours ago",
  //     likes: 156,
  //     comments: 23,
  //     shares: 8,
  //     isLiked: false,
  //     isSaved: true,
  //   },
  // ])

  

  // const filteredPosts = posts.filter((post) => {
  //   const matchesSearch =
  //     post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     post.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  //   const matchesFilter =
  //     filterType === "all" || (filterType === "liked" && post.isLiked) || (filterType === "saved" && post.isSaved)
  //   return matchesSearch && matchesFilter
  // })

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {/* Header with Search */}
      <div className="sticky top-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 backdrop-blur-md border-b border-border/50 p-4 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            StreamSocial
          </h1>
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

      {/* Stories */}
      <Stories />

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
                className={`text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  user.isFollowing 
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
        {posts.length > 0 ? (
          posts
            .filter((post) => post.user_id !== authUser?.user_id) 
            .map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post}  />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-primary/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )} */}
      </div>
    </div>
  )
}
