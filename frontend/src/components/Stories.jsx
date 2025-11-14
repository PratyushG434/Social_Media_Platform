"use client"

import { useEffect, useState } from "react"
import API from "../service/api"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import Avatar from "./Avatar"; // Import your reusable Avatar component

export default function Stories() {
  const [storiesByUsers, setStoriesByUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { authUser } = useAuthStore()

  useEffect(() => {
    // If the user isn't logged in, we don't need to fetch anything.
    if (!authUser) {
      setLoading(false)
      return;
    }

    const fetchAndProcessStories = async () => {
      try {
        const response = await API.getStoriesFeed()
        if (!response?.isSuccess) throw new Error("Failed to fetch stories")

        const storyData = response.data.stories || []

        // Step 1: Group all stories by user to handle multiple stories per person
        const storiesGroupedByUser = storyData.reduce((acc, story) => {
          const userId = story.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              username: story.username,
              display_name: story.display_name || story.username,
              profile_pic_url: story.profile_pic_url,
              stories: [],
            }
          }
          acc[userId].stories.push({
            id: story.story_id,
            mediaUrl: story.media_url,
            // ... add other story properties if needed
          });
          return acc
        }, {})

        // Step 2: Create a separate object for the current user's stories (if they exist)
        const myStories = storiesGroupedByUser[authUser.user_id] || null;

        // Step 3: Create the final list, starting with "Your Story"
        const finalStoriesList = [
          // This is your story bubble, always present
          {
            isOwn: true,
            user_id: authUser.user_id,
            username: authUser.username,
            display_name: "Your Story",
            profile_pic_url: authUser.profile_pic_url, // Just the URL string
            hasStory: !!myStories, // True if myStories is not null
          },
          // Now, add everyone else's stories
          ...Object.values(storiesGroupedByUser)
            .filter(userGroup => userGroup.user_id !== authUser.user_id) // Exclude yourself from this list
            .map(userGroup => ({
              isOwn: false,
              user_id: userGroup.user_id,
              username: userGroup.username,
              display_name: userGroup.display_name,
              profile_pic_url: userGroup.profile_pic_url,
              hasStory: true, // By definition, they are in this list because they have stories
              isViewed: false, // Placeholder for future logic
            }))
        ];

        setStoriesByUsers(finalStoriesList);

      } catch (err) {
        console.error("Error fetching stories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAndProcessStories()
  }, [authUser]) // Re-run this effect if the logged-in user changes

  const handleStoryClick = (story) => {
    if (story.isOwn) {
      if (story.hasStory) {
        // If you have a story, view it
        navigate("story-viewer", { state: { userIds: [story.user_id] } })
      } else {
        // If you don't have a story, go to the create page
        navigate("story-create")
      }
    } else {
      // For others, always go to the viewer
      navigate("story-viewer", { state: { userIds: [story.user_id] } })
    }
  }
  
  // Render a loading state
  if (loading) {
    return (
      <div className="bg-card border-b border-border p-4 flex space-x-4">
        {/* Skeleton loaders for a better UX */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full"></div>
            <div className="h-2 w-12 bg-muted rounded mt-2"></div>
          </div>
        ))}
      </div>
    )
  }

  // If not logged in, don't render the component
  if (!authUser) {
    return null;
  }

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {storiesByUsers.map((userStoryGroup) => (
          <div
            key={userStoryGroup.user_id}
            onClick={() => handleStoryClick(userStoryGroup)}
            className="flex-shrink-0 cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="relative">
              {/* This div creates the colored ring */}
              <div
                className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center
                  ${userStoryGroup.isOwn && !userStoryGroup.hasStory ? "bg-transparent" // No ring for "add story"
                    : userStoryGroup.hasStory && !userStoryGroup.isViewed ? "bg-gradient-to-tr from-primary to-secondary" // Active story ring
                    : "bg-muted" // Viewed story ring
                  }`}
              >
                {/* This div provides the white space between the ring and the avatar */}
                <div className="bg-background p-0.5 rounded-full w-full h-full">
                  {/* The Avatar component handles rendering the image or initials */}
                  <Avatar
                    src={userStoryGroup.profile_pic_url}
                    name={userStoryGroup.display_name}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* The "+" button, only shown for the current user */}
              {userStoryGroup.isOwn && (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the parent onClick from firing
                    navigate("story-create"); // Always navigate to create page
                  }}
                  className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold border-2 border-card hover:scale-110 transition-transform"
                >
                  +
                </div>
              )}
            </div>

            <p className="text-xs text-center text-card-foreground max-w-[64px] truncate">
              {userStoryGroup.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}