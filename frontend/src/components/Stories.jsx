"use client"

import { useState } from "react"

export default function Stories({ onNavigate }) {
  const [stories] = useState([
    {
      id: 1,
      user: {
        username: "your_story",
        displayName: "Your Story",
        profilePic: "/add-story.jpg",
      },
      isOwn: true,
      hasStory: false,
    },
    {
      id: 2,
      user: {
        username: "sarah_wilson",
        displayName: "Sarah",
        profilePic: "/woman-profile.png",
      },
      isOwn: false,
      hasStory: true,
      isViewed: false,
    },
    {
      id: 3,
      user: {
        username: "mike_photo",
        displayName: "Mike",
        profilePic: "/man-photographer.png",
      },
      isOwn: false,
      hasStory: true,
      isViewed: true,
    },
    {
      id: 4,
      user: {
        username: "foodie_anna",
        displayName: "Anna",
        profilePic: "/woman-chef-preparing-food.png",
      },
      isOwn: false,
      hasStory: true,
      isViewed: false,
    },
  ])

  const handleStoryClick = (story) => {
    if (story.isOwn && !story.hasStory) {
      // Navigate to story creation
      onNavigate("storyCreate")
    } else {
      // Navigate to story viewer
      onNavigate("storyViewer")
    }
  }

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} onClick={() => handleStoryClick(story)} className="flex-shrink-0 cursor-pointer">
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  story.isOwn && !story.hasStory
                    ? "bg-border"
                    : story.hasStory && !story.isViewed
                      ? "bg-gradient-to-tr from-primary to-secondary"
                      : "bg-muted"
                }`}
              >
                <img
                  src={story.user.profilePic || "/placeholder.svg"}
                  alt={story.user.displayName}
                  className="w-full h-full rounded-full object-cover bg-background p-0.5"
                />
              </div>
              {story.isOwn && !story.hasStory && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  +
                </div>
              )}
            </div>
            <p className="text-xs text-center mt-2 text-card-foreground max-w-16 truncate">{story.user.displayName}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
