"use client"

import { useState } from "react"
import { useNotifications } from "./Notification-system";
import API from "../service/api";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar"; // Import Avatar

export default function PostCreate() {
  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [isPosting, setIsPosting] = useState(false)

  const { addNotification } = useNotifications();
  const { authUser } = useAuthStore();

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
    if (!content.trim() && !mediaFile) return

    try {
      setIsPosting(true)

      const formData = new FormData()
      
      // FIX: Use 'content' for the file as defined in backend routes
      if (mediaFile) {
        formData.append("content", mediaFile)
      }
      
      // FIX: Use 'content' for text, which is handled correctly by formData
      formData.append("content", content.trim());
      
      // Determine content type based on file presence
      let contentType = 'text';
      if (mediaFile) {
        contentType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      }
      formData.append("content_type", contentType);

      const response = await API.createPost(formData)

      if (!response?.isSuccess) throw new Error("Failed to create post")

      addNotification?.({
        type: "success",
        title: "Post Created",
        message: "Your post was successfully uploaded!"
      })

      setContent("")
      setMediaFile(null)
      setMediaPreview(null)
      // Redirect or navigate back after successful post (assuming use of navigate outside this component)
      // onNavigate?.("dashboard") 

    } catch (err) {
      addNotification?.({
        type: "error",
        title: "Post Failed",
        message: err?.message || "Something went wrong"
      })
    } finally {
      setIsPosting(false)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-semibold text-card-foreground">Create Post</h1>
          <button
            onClick={handlePost}
            disabled={(!content.trim() && !mediaFile) || isPosting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Post Creation Form */}
      <div className="p-4">
        <div className="bg-card rounded-lg border border-border p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            {/* FIX: Use Avatar component */}
            <Avatar 
                src={authUser?.profile_pic_url}
                name={authUser?.display_name || authUser?.username}
                className="w-10 h-10"
            />
            <div>
              <p className="font-semibold text-card-foreground">{authUser?.display_name}</p>
              <p className="text-sm text-muted-foreground">@{authUser?.username}</p>
            </div>
          </div>

          {/* Content Input */}
          <form onSubmit={handlePost}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent border-none resize-none text-card-foreground placeholder-muted-foreground focus:outline-none text-lg min-h-32"
              rows={4}
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-4">
                <img
                  src={mediaPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full max-h-80 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {/* Media Upload */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer text-muted-foreground hover:text-card-foreground transition-colors">
                  <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
                  <span className="text-xl">📷</span>
                </label>
                <button type="button" className="text-muted-foreground hover:text-card-foreground transition-colors">
                  <span className="text-xl">😊</span>
                </button>
                <button type="button" className="text-muted-foreground hover:text-card-foreground transition-colors">
                  <span className="text-xl">📍</span>
                </button>
              </div>
              <div className="text-sm text-muted-foreground">{content.length}/280</div>
            </div>
          </form>
        </div>


      </div>
    </div>
  )
}