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
// import Shorts from "./Shorts"
import Explore from "./Explore"
import ChatPage from "./Chat"
export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavigation />

      <main className="flex-1 ml-64">
        {/* All routes are relative to /dashboard/* */}
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="explore" element={<Explore />} />
          <Route path="videos" element={<Videos />} />
          {/* <Route path="shorts" element={<Shorts />} /> */}
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Create Pages */}
          <Route path="post-create" element={<PostCreate />} />
          <Route path="story-create" element={<StoryCreate />} />

          {/* Viewer Pages (if StoryViewer needs to be here) */}
          <Route path="story-viewer" element={<StoryViewer />} /> 
        </Routes>
      </main>

      {/* Floating Create Post Button */}
      <button
        onClick={() => navigate("/dashboard/post-create")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  )
}