"use client";

import { useState, useEffect } from "react";
import API from "../service/api";
import { useNavigate } from "react-router-dom";

export default function Videos({ currentUser, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allVideos, setAllVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", label: "All Videos" },
    { id: "trending", label: "Trending" },
    { id: "music", label: "Music" },
    { id: "gaming", label: "Gaming" },
    { id: "education", label: "Education" },
    { id: "comedy", label: "Comedy" },
  ];

  const navigate = useNavigate();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await API.getVideos();

        if (!response?.isSuccess) {
          throw new Error(response?.message || "Failed to fetch videos");
        }

        setAllVideos(response.data.posts || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Temporary: show all videos (no category info from backend)
  const filteredVideos = allVideos;

  // --- Hover Handlers ---
  const handleMouseOver = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (video) video.play();
  };

  const handleMouseOut = (e) => {
    const video = e.currentTarget.querySelector("video");
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-muted-foreground mt-10">
          Loading videos...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive mt-10">
          Error: {error}
        </div>
      );
    }

    if (filteredVideos.length === 0) {
      return (
        <div className="text-center text-muted-foreground mt-10">
          No videos found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.post_id}
            className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            onMouseEnter={handleMouseOver}
            onMouseLeave={handleMouseOut}
            onClick={() => navigate(`/dashboard/post/${video.post_id}`)}
          >
            <div className="relative">
              <div className="w-full aspect-video bg-black overflow-hidden">
                <video
                  src={video.media_url || "/placeholder.svg"}
                  loop
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-card-foreground mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base">
                {video.content || "No title"}
              </h3>
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                <span className="truncate max-w-[60%]">
                  {video.display_name || video.username}
                </span>
                <span>{video.likes_count} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header & Category Filters --- */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4 md:mb-6">
            Videos
          </h1>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ${
                  selectedCategory === category.id
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
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {renderContent()}
      </div>
    </div>
  );
}
