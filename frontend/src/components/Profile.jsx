"use client"

import { useEffect, useState } from "react"
import API from "../service/api"
import { useNavigate } from "react-router-dom"
export default function Profile({ userId}) {
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("posts")
  const navigate = useNavigate()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.getUserProfile(userId)
        if (!response?.isSuccess) throw new Error("Failed to fetch user")
        console.log(response.data.user)
        setUser(response.data.user)
        setUserPosts(response.data.posts || []) // when you add posts in backend
      } catch (err) {
        console.log("Profile fetch error =>", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-muted-foreground">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>

          <h1 className="text-xl font-semibold text-card-foreground">@{user.username}</h1>

          <button
            onClick={() => navigate("/dashboard/settings")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start space-x-4 mb-6">
          <img
            src={user.profile_pic_url || "/placeholder.svg"}
            alt={user.display_name}
            className="w-20 h-20 rounded-full object-cover"
          />

          <div className="flex-1">
            <h2 className="text-xl font-bold text-card-foreground">{user.display_name}</h2>
            <p className="text-muted-foreground mb-3">{user.bio || "No bio yet."}</p>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-card-foreground">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>

              <button className="text-center">
                <p className="font-bold text-card-foreground">{user.followers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>

              <button className="text-center">
                <p className="font-bold text-card-foreground">{user.following?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="flex-1 bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Edit Profile
              </button>
              <button className="bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "posts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <span className="text-lg mr-2">📱</span> Posts
            </button>

            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === "tagged"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <span className="text-lg mr-2">🏷️</span> Tagged
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map((post) => (
              <div key={post.post_id} className="relative aspect-square group cursor-pointer">
                <img
                  src={post.media_url || "/placeholder.svg"}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {userPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No posts yet.</p>
            )}
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-muted-foreground">No tagged posts yet</p>
          </div>
        )}
      </div>
    </div>
  )
}