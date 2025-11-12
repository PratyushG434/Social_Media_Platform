"use client"

import { useEffect, useState } from "react"
import API from "../service/api"
import { useNavigate } from "react-router-dom"

export default function Stories({ currentUser }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await API.getStoriesFeed()
        if (!response?.isSuccess) throw new Error("Failed to fetch stories")

        const storyData = response.data.stories || []

        // ✅ Check if current user already has a story in feed
        const userHasStory = storyData.some((s) => s.username === currentUser?.username)

        // ✅ Map backend stories into existing structure (excluding current user’s own story)
        const formattedStories = storyData
          .filter((s) => s.username !== currentUser?.username) // remove your own story to avoid duplication
          .map((s) => ({
            id: s.story_id,
            user_id : s.user_id,
            user: {
              username: s.username,
              displayName: s.display_name || s.username,
              profilePic: s.profile_pic_url,
            },
            hasStory: true,
            isViewed: false,
            isOwn: false,
          }))

        // ✅ Always insert "Your Story" bubble first
        const yourStory = {
          id: 0,
          user: {
            username: currentUser?.username || "your_story",
            displayName: "Your Story",
            profilePic: currentUser?.profilePic || "/add-story.jpg",
          },
          isOwn: true,
          hasStory: userHasStory, // now correctly reflects backend
        }

        setStories([yourStory, ...formattedStories])
      } catch (err) {
        console.error("Error fetching stories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [currentUser])

  // ✅ Handles story clicks
  const handleStoryClick = (story, clickedPlus = false) => {
    if (story.isOwn) {
      if (clickedPlus) {
        navigate("story-create") // always open create on + click
      } else {
        if (story.hasStory) {
          navigate("story-viewer") // open your own story if exists
        } else {
          navigate("story-create") // otherwise create
        }
      }
    } else {
      console.log(story.user_id)
      navigate("story-viewer", { state: { userIds: [story.user_id] } })
    }
  }

  if (loading) {
    return (
      <div className="bg-card border-b border-border p-4 text-center text-muted-foreground">
        Loading stories...
      </div>
    )
  }

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={(e) => {
              // Prevent + button click from triggering main bubble
              if (!e.target.closest(".create-story-btn")) {
                handleStoryClick(story)
              }
            }}
            className="flex-shrink-0 cursor-pointer"
          >
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

              {/* ✅ + Button for creating story (always clickable) */}
              {story.isOwn && (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStoryClick(story, true)
                  }}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold create-story-btn"
                >
                  +
                </div>
              )}
            </div>

            <p className="text-xs text-center mt-2 text-card-foreground max-w-16 truncate">
              {story.user.displayName}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}