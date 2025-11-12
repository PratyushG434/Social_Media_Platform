"use client"

import { useState, useEffect } from "react"
import API from "../service/api"

import { useLocation,useNavigate } from "react-router-dom"
export default function StoryViewer() {
  const [storiesData, setStoriesData] = useState([])
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [showReactions, setShowReactions] = useState(false)
  const location = useLocation()


  const { userIds = []} = location.state || {}
  const   navigate = useNavigate()
  // ✅ Fetch stories for each userId
  useEffect(() => {
    const fetchStories = async () => {
      try {
   
        if (!userIds.length) return
          

        const allUsersStories = []

        for (const userId of userIds) {
          const response = await API.getUserStories(userId)
          if (response?.isSuccess && response.data?.stories?.length) {
            const userStories = response.data.stories
            const first = userStories[0]
            allUsersStories.push({
              userId,
              user: {
                username: first.username,
                displayName: first.display_name || first.username,
                profilePic: first.profile_pic_url,
              },
              stories: userStories.map((s) => ({
                id: s.story_id,
                mediaUrl: s.media_url,
                contentType: s.content_type,
                timestamp: new Date(s.timestamp).toLocaleString(),
                duration: 5000,
              })),
            })
          }
        }

        setStoriesData(allUsersStories)
      } catch (err) {
        console.error("Error fetching user stories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [userIds])

  const currentUserStories = storiesData[currentUserIndex]
  const currentStory = currentUserStories?.stories[currentStoryIndex]

  // Auto progress story
  useEffect(() => {
    if (!currentStory) return

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (currentStory.duration / 100)
        if (newProgress >= 100) {
          handleNextStory()
          return 0
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(timer)
  }, [currentStory, currentStoryIndex, currentUserIndex])

  const handleNextStory = () => {
    if (!currentUserStories) return
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else if (currentUserIndex < storiesData.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      navigate("/dashboard")
    }
  }

  const handlePrevStory = () => {
    if (!currentUserStories) return
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1)
      const prevUserStories = storiesData[currentUserIndex - 1]
      setCurrentStoryIndex(prevUserStories.stories.length - 1)
      setProgress(0)
    }
  }

  const handleReply = (e) => {
    e.preventDefault()
    if (replyText.trim()) {
      setReplyText("")
      alert("Reply sent!") // you can later replace this with your backend comment/reply logic
    }
  }

  const handleReaction = (reaction) => {
    setShowReactions(false)
    alert(`Sent ${reaction} reaction!`)
  }

  const reactions = ["❤️", "😂", "😮", "😢", "😡", "👍"]

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <p>Loading stories...</p>
      </div>
    )
  }

  if (!currentStory) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <p>No stories available</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Back to Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
        {currentUserStories.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <img
            src={currentUserStories.user.profilePic || "/placeholder.svg"}
            alt={currentUserStories.user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">{currentUserStories.user.displayName}</p>
            <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")} className="text-white hover:text-white/70 transition-colors">
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentStory.contentType === "video" ? (
          <video
            src={currentStory.mediaUrl}
            autoPlay
            muted
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            src={currentStory.mediaUrl || "/placeholder.svg"}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation areas */}
        <button onClick={handlePrevStory} className="absolute left-0 top-0 w-1/3 h-full z-10" />
        <button onClick={handleNextStory} className="absolute right-0 top-0 w-1/3 h-full z-10" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        {showReactions && (
          <div className="mb-4 flex justify-center space-x-4">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="text-3xl hover:scale-110 transition-transform"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleReply} className="flex items-center space-x-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to story..."
            className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="button"
            onClick={() => setShowReactions(!showReactions)}
            className="text-white hover:text-white/70 transition-colors"
          >
            <span className="text-2xl">😊</span>
          </button>
          <button
            type="submit"
            disabled={!replyText.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}