"use client"

import { useEffect, useState, useCallback } from "react"
import API from "../service/api"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import Avatar from "./Avatar";

export default function Stories() {
  const [storiesByUsers, setStoriesByUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { authUser } = useAuthStore()

  const fetchAndProcessStories = useCallback(async () => {
    if (!authUser) {
        setLoading(false);
        return;
    };
    
    try {
      const response = await API.getStoriesFeed()
      if (!response?.isSuccess) throw new Error("Failed to fetch stories")

      const storyData = response.data.stories || []

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
        acc[userId].stories.push({ id: story.story_id /*, ...other story data */ });
        return acc
      }, {})

      const myStories = storiesGroupedByUser[authUser.user_id] || null;

      const finalStoriesList = [
        {
          isOwn: true,
          user_id: authUser.user_id,
          username: authUser.username,
          display_name: "Your Story",
          profile_pic_url: authUser.profile_pic_url, 
          hasStory: !!myStories,
        },
        ...Object.values(storiesGroupedByUser)
          .filter(userGroup => userGroup.user_id !== authUser.user_id)
          .map(userGroup => ({
            isOwn: false,
            user_id: userGroup.user_id,
            username: userGroup.username,
            display_name: userGroup.display_name,
            profile_pic_url: userGroup.profile_pic_url,
            hasStory: true,
            isViewed: false, 
          }))
      ];

      setStoriesByUsers(finalStoriesList);

    } catch (err) {
      console.error("Error fetching stories:", err)
    } finally {
      setLoading(false)
    }
  }, [authUser, navigate]);

  useEffect(() => {
    fetchAndProcessStories();
  }, [fetchAndProcessStories]); 

  const handleStoryClick = (story) => {
    if (story.isOwn) {
      if (story.hasStory) {
        navigate("/dashboard/story-viewer", { state: { userIds: [story.user_id] } })
      } else {
        navigate("/dashboard/story-create")
      }
    } else {
      navigate("/dashboard/story-viewer", { state: { userIds: [story.user_id] } })
    }
  }

  if (loading) {
    return (
      <div className="bg-card border-b border-border p-4 flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full"></div>
            <div className="h-2 w-12 bg-muted rounded mt-2"></div>
          </div>
        ))}
      </div>
    )
  }

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
              <div
                className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center
                  ${userStoryGroup.isOwn && !userStoryGroup.hasStory ? "bg-transparent"
                    : userStoryGroup.hasStory && !userStoryGroup.isViewed ? "bg-gradient-to-tr from-primary to-secondary"
                    : "bg-muted"
                  }`}
              >
                <div className="bg-background p-0.5 rounded-full w-full h-full">
                  <Avatar
                    src={userStoryGroup.profile_pic_url}
                    name={userStoryGroup.display_name}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {userStoryGroup.isOwn && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/dashboard/story-create");
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