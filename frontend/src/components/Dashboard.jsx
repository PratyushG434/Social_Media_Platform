"use client"

import { Routes, Route, useNavigate } from "react-router-dom"
import SideNavigation from "./SideNavigation"
import Feed from "./Feed"
import Profile from "./Profile"
import PostCreate from "./PostCreate"
import Messages from "./Messages"
import Notifications from "./Notifications"
import Settings from "./Settings"
import StoryViewer from "./StoryViewer"
import StoryCreate from "./StoryCreate"
import Videos from "./Videos"
import Shorts from "./Shorts"
import Explore from "./Explore"

export default function Dashboard() {
  const navigate = useNavigate()

  // // ✅ Add this handler
  // const handleNavigate = (path) => {
  //   navigate(path)
  // }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ✅ Pass both props */}
      {/* <SideNavigation onLogout={onLogout} onNavigate={handleNavigate} /> */}

      <main className="flex-1 ml-64">
        <Routes>
          <Route path="/" element={<Feed currentUser={currentUser} />} />
          <Route path="/explore" element={<Explore currentUser={currentUser} />} />
          <Route path="/videos" element={<Videos currentUser={currentUser} />} />
          <Route path="/shorts" element={<Shorts currentUser={currentUser} />} />
          <Route path="/profile" element={<Profile currentUser={currentUser} />} />
          <Route path="/post-create" element={<PostCreate currentUser={currentUser} />} />
          <Route path="/messages" element={<Messages currentUser={currentUser} />} />
          <Route path="/notifications" element={<Notifications currentUser={currentUser} />} />
          <Route path="/settings" element={<Settings currentUser={currentUser} />} />
          <Route path="/story-viewer" element={<StoryViewer />} />
          <Route path="/story-create" element={<StoryCreate currentUser={currentUser} />} />
        </Routes>
      </main>

      <button
        onClick={() => navigate("/dashboard/post-create")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  )
}
