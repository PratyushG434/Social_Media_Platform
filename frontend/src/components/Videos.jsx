"use client"

import { useState, useEffect } from "react"
import API from "../service/api" // Assuming API service is here, like in PostCard.jsx
import { useNavigate } from "react-router-dom"

export default function Videos({ currentUser, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [allVideos, setAllVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const categories = [
    { id: "all", label: "All Videos" },
    { id: "trending", label: "Trending" },
    { id: "music", label: "Music" },
    { id: "gaming", label: "Gaming" },
    { id: "education", label: "Education" },
    { id: "comedy", label: "Comedy" },
  ]
  const navigate = useNavigate();
  // --- Data Fetching ---
  // --- Data Fetching (FIXED) ---
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // This function now exists in your API service
        const response = await API.getVideos()

        if (!response?.isSuccess) {
          throw new Error(response?.message || "Failed to fetch videos")
        }

        // --- THE KEY FIX ---
        // The posts array is inside response.data.posts,
        // not response.posts
        setAllVideos(response.data.posts || [])

      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, []) // Empty dependency array means this runs once on mount

  // --- Filtering Logic ---
  // FIXME: The API (GET /api/posts/videos) does not return a 'category' field for each post.
  // The filtering logic below will not work as 'video.category' will be undefined.
  // As a temporary fix, we are showing all videos.
  // const filteredVideos =
  //   selectedCategory === "all" ? allVideos : allVideos.filter((video) => video.category === selectedCategory)

  // Temporary solution:
  const filteredVideos = allVideos

  // --- Hover Handlers ---
  const handleMouseOver = (e) => {
    // Find the video element within the card and play it
    const video = e.currentTarget.querySelector("video")
    if (video) {
      video.play()
    }
  }

  const handleMouseOut = (e) => {
    // Find the video, pause it, and reset its time
    const video = e.currentTarget.querySelector("video")
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-muted-foreground mt-10">Loading videos...</div>
    }

    if (error) {
      return <div className="text-center text-destructive mt-10">Error: {error}</div>
    }

    if (filteredVideos.length === 0) {
      return <div className="text-center text-muted-foreground mt-10">No videos found.</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.post_id}
            className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onMouseEnter={handleMouseOver}
            onMouseLeave={handleMouseOut}
            onClick={() => navigate(`/post/${video.post_id}`)} // Assumes onNavigate takes the post ID
          >
            <div className="relative">
              {/* Replaced <img> with <video> for hover-play */}
              <video
                src={video.media_url || "/placeholder.svg"}
                loop
                muted
                preload="metadata"
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200 bg-black"
              >
                Your browser does not support the video tag.
              </video>

              {/* Duration div removed as API does not provide this data */}

              {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-xl">▶</span>
                </div>
              </div> */}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{video.content || "Video Title"}</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{video.display_name || video.username}</span>
                <span>{video.likes_count} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header & Category Filters --- */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-primary mb-6">Videos</h1>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Video Grid --- */}
      <div className="p-6">{renderContent()}</div>
    </div>
  )
}