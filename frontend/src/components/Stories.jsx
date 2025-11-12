"use client"

import { useEffect, useState } from "react"
import API from "../service/api"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
export default function Stories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { authUser } = useAuthStore();

  const currentUser = authUser
  useEffect(() => {
    if (!authUser) return
    const fetchStories = async () => {
      try {
        const response = await API.getStoriesFeed()
        if (!response?.isSuccess) throw new Error("Failed to fetch stories")

        const storyData = response.data.stories || []

        // ✅ Group all stories by username so each user has one bubble
        const groupedStories = storyData.reduce((acc, s) => {
          if (!acc[s.username]) {
            acc[s.username] = {
              user_id: s.user_id,
              username: s.username,
              display_name: s.display_name || s.username,
              profile_pic_url: s.profile_pic_url,
              stories: [],
            }
          }
          acc[s.username].stories.push({
            id: s.story_id,
            content: s.content,
            mediaUrl: s.media_url,
            contentType: s.content_type,
            timestamp: s.timestamp,
            expiresAt: s.expires_at,
          })
          return acc
        }, {})

        // ✅ Convert object to array
        const groupedArray = Object.values(groupedStories)

        // ✅ Filter out your own stories from feed
        const othersStories = groupedArray.filter(
          (u) => u.user_id !== currentUser?.user_id
        )

        // ✅ Determine if you already have a story
        const userHasStory = groupedArray.some(
          (u) => u.username === currentUser?.username
        )

        // ✅ Create your story bubble (always leftmost)
        const yourStory = {
          id: authUser.user_id,
          user: {
            username: currentUser?.username || "your_story",
            displayName: "Your Story",
            profilePic: currentUser?.profilePic || "/add-story.jpg",
          },
          isOwn: true,
          hasStory: userHasStory,
        }

        // ✅ Map the grouped stories into the same UI-friendly structure
        const formattedStories = othersStories.map((u) => ({
          id: u.user_id,
          user: {
            username: u.username,
            displayName: u.display_name,
            profilePic: u.profile_pic_url,
          },
          hasStory: true,
          isViewed: false,
          isOwn: false,
        }))
      

        setStories([yourStory, ...formattedStories])
      } catch (err) {
        console.error("Error fetching stories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [authUser])

  // ✅ Handle click logic
  const handleStoryClick = (story, clickedPlus = false) => {
    if (story.isOwn) {
      if (clickedPlus) {
        navigate("story-create") // always open create on +
      } else {
        if (story.hasStory) navigate("story-viewer", { state: { userIds: [story.id] } })
        else navigate("story-create")
      }
    } else {
      navigate("story-viewer", { state: { userIds: [story.id] } })
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
              if (!e.target.closest(".create-story-btn")) handleStoryClick(story)
            }}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${story.isOwn && !story.hasStory
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
                  onClick={() => handleStoryClick(story, story.isOwn)}
                />
              </div>

              {/* ✅ Always show + for your story */}
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