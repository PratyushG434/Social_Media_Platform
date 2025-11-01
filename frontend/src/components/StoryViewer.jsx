"use client"

import { useState, useEffect } from "react"

export default function StoryViewer({ onNavigate }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Mock stories data
  const [storiesData] = useState([
    {
      userId: 2,
      user: {
        username: "sarah_wilson",
        displayName: "Sarah Wilson",
        profilePic: "/placeholder.svg?key=sarah_story",
      },
      stories: [
        {
          id: 1,
          mediaUrl: "/placeholder.svg?key=story1",
          contentType: "image",
          timestamp: "2h ago",
          duration: 5000,
        },
        {
          id: 2,
          mediaUrl: "/placeholder.svg?key=story2",
          contentType: "image",
          timestamp: "1h ago",
          duration: 5000,
        },
      ],
    },
    {
      userId: 3,
      user: {
        username: "mike_photo",
        displayName: "Mike Photography",
        profilePic: "/placeholder.svg?key=mike_story",
      },
      stories: [
        {
          id: 3,
          mediaUrl: "/placeholder.svg?key=story3",
          contentType: "image",
          timestamp: "3h ago",
          duration: 5000,
        },
      ],
    },
  ])

  const [replyText, setReplyText] = useState("")
  const [showReactions, setShowReactions] = useState(false)

  const currentUserStories = storiesData[currentUserIndex]
  const currentStory = currentUserStories?.stories[currentStoryIndex]

  // Auto-progress story
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
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else if (currentUserIndex < storiesData.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onNavigate("dashboard")
    }
  }

  const handlePrevStory = () => {
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
      // Mock sending reply
      setReplyText("")
      alert("Reply sent!")
    }
  }

  const handleReaction = (reaction) => {
    // Mock sending reaction
    setShowReactions(false)
    alert(`Sent ${reaction} reaction!`)
  }

  const reactions = ["❤️", "😂", "😮", "😢", "😡", "👍"]

  if (!currentStory) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">📱</div>
          <p>No stories available</p>
          <button
            onClick={() => onNavigate("dashboard")}
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
        <button onClick={() => onNavigate("dashboard")} className="text-white hover:text-white/70 transition-colors">
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentStory.mediaUrl || "/placeholder.svg"}
          alt="Story"
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation areas */}
        <button onClick={handlePrevStory} className="absolute left-0 top-0 w-1/3 h-full z-10" />
        <button onClick={handleNextStory} className="absolute right-0 top-0 w-1/3 h-full z-10" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        {/* Reactions */}
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

        {/* Reply input */}
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
