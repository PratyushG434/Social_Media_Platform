"use client"

import { useState } from "react"

export default function Videos({ currentUser, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", label: "All Videos" },
    { id: "trending", label: "Trending" },
    { id: "music", label: "Music" },
    { id: "gaming", label: "Gaming" },
    { id: "education", label: "Education" },
    { id: "comedy", label: "Comedy" },
  ]

  const videos = [
    {
      id: 1,
      title: "Amazing Sunset Timelapse",
      creator: "NatureFilms",
      views: "2.3M",
      duration: "4:32",
      thumbnail: "/sunset-beach-tranquil.png",
      category: "trending",
    },
    {
      id: 2,
      title: "Cooking Masterclass: Perfect Pasta",
      creator: "ChefMaria",
      views: "890K",
      duration: "12:45",
      thumbnail: "/delicious-pasta-dish.png",
      category: "education",
    },
    {
      id: 3,
      title: "Photography Tips for Beginners",
      creator: "PhotoPro",
      views: "1.2M",
      duration: "8:20",
      thumbnail: "/assorted-camera-gear.png",
      category: "education",
    },
    {
      id: 4,
      title: "Street Photography Adventures",
      creator: "UrbanLens",
      views: "654K",
      duration: "6:15",
      thumbnail: "/man-photographer.png",
      category: "trending",
    },
  ]

  const filteredVideos =
    selectedCategory === "all" ? videos : videos.filter((video) => video.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-primary mb-6">Videos</h1>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
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

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-xl">▶</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{video.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{video.creator}</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
