"use client"

import { useState } from "react"
import { useNotifications } from "./Notification-system"
import { useNavigate } from "react-router-dom"
import API from "../service/api"
export default function StoryCreate({ currentUser, onNavigate }) {
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [storyText, setStoryText] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState("#000000")
  const [isPosting, setIsPosting] = useState(false)
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!storyText.trim() && !mediaFile) return

    try {
      setIsPosting(true)

      // Create FormData for upload
      const formData = new FormData()

      // Add file if exists (for 'image' or 'video' stories)
      if (mediaFile) {
        formData.append("content", mediaFile)
        formData.append(
          "content_type",
          mediaFile.type.startsWith("video") ? "video" : "image"
        )
      } else {
        // Otherwise, it's a text story
        formData.append("content", storyText.trim())
        formData.append("content_type", "text")
      }

      // Call the API
      const response = await API.createStory(formData)

      if (!response?.isSuccess) {
        throw new Error("Failed to create story")

      }

      // ✅ You can log or handle the response here
      console.log("Story created successfully!", response.data.story)

      addNotification?.({
        type: "success",
        title: "Story Created",
        message: "Your story was successfully uploaded!"
      })

      // Reset UI
      setStoryText("")
      setMediaFile(null)
      setMediaPreview(null)

      // Navigate back
      onNavigate?.("dashboard")
    } catch (err) {
      console.error("Story upload failed:", err)
      addNotification?.({
        type: "error",
        title: "Story Failed",
        message: err?.message || "Something went wrong"
      })

    } finally {
      setIsPosting(false)
    }
  }

  const colorOptions = [
    "#000000",
    "#ffffff",
    "#ff4444",
    "#44ff44",
    "#4444ff",
    "#ffff44",
    "#ff44ff",
    "#44ffff",
    "#ff8844",
    "#8844ff",
  ]

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <button onClick={() => navigate("dashboard")} className="text-white hover:text-white/70 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-white font-semibold">Create Story</h1>
        <button
          onClick={handlePost}
          disabled={(!mediaFile && !storyText.trim()) || isPosting}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPosting ? "Posting..." : "Share"}
        </button>
      </div>

      {/* Story preview */}
      <div className="relative w-full h-full flex items-center justify-center">
        {mediaPreview ? (
          <img
            src={mediaPreview || "/placeholder.svg"}
            alt="Story preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor }}>
            {storyText ? (
              <div className="text-center p-8">
                <p className="text-2xl font-bold break-words" style={{ color: textColor }}>
                  {storyText}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white/70">Add a photo or write something</p>
              </div>
            )}
          </div>
        )}

        {/* Text overlay on image */}
        {mediaPreview && storyText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-bold text-center p-4 bg-black/50 rounded-lg" style={{ color: textColor }}>
              {storyText}
            </p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 space-y-4">
        {/* Text input */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="Add text to your story..."
            className="w-full bg-transparent text-white placeholder-white/70 resize-none focus:outline-none"
            rows={2}
          />

          {/* Color options */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-2">
              <span className="text-white text-sm">Text:</span>
              {colorOptions.slice(0, 5).map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${textColor === color ? "border-white" : "border-white/30"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <span className="text-white text-sm">BG:</span>
              {colorOptions.slice(0, 5).map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${backgroundColor === color ? "border-white" : "border-white/30"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Media and tools */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer text-white hover:text-white/70 transition-colors">
              <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
              <span className="text-2xl">📷</span>
            </label>
            <button className="text-white hover:text-white/70 transition-colors">
              <span className="text-2xl">🎨</span>
            </button>
            <button className="text-white hover:text-white/70 transition-colors">
              <span className="text-2xl">😊</span>
            </button>
            <button className="text-white hover:text-white/70 transition-colors">
              <span className="text-2xl">🎵</span>
            </button>
          </div>

          {mediaFile && (
            <button
              onClick={() => {
                setMediaFile(null)
                setMediaPreview(null)
              }}
              className="text-white hover:text-white/70 transition-colors"
            >
              <span className="text-xl">🗑️</span>
            </button>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3">
          <img
            src={currentUser?.profilePic || "/placeholder.svg?height=32&width=32&query=user+profile"}
            alt={currentUser?.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">{currentUser?.displayName}</p>
            <p className="text-white/70 text-xs">Your story will be visible for 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
