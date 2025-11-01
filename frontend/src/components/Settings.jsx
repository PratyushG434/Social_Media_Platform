"use client"

import { useState } from "react"

export default function Settings({ currentUser, onNavigate }) {
  const [activeSection, setActiveSection] = useState("profile")
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    email: currentUser?.email || "",
    phone: "",
    website: "",
  })
  const [accountSettings, setAccountSettings] = useState({
    privateAccount: false,
    allowMessages: true,
    showOnlineStatus: true,
    allowTagging: true,
  })
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    posts: false,
  })

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value })
  }

  const handleAccountChange = (field, value) => {
    setAccountSettings({ ...accountSettings, [field]: value })
  }

  const handleNotificationChange = (field, value) => {
    setNotifications({ ...notifications, [field]: value })
  }

  const handleSave = () => {
    // Mock save functionality
    alert("Settings saved successfully!")
  }

  const sections = [
    { id: "profile", title: "Edit Profile", icon: "👤" },
    { id: "account", title: "Account", icon: "⚙️" },
    { id: "privacy", title: "Privacy", icon: "🔒" },
    { id: "notifications", title: "Notifications", icon: "🔔" },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate("profile")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-semibold text-card-foreground">Settings</h1>
          <button
            onClick={handleSave}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/3 bg-card border-r border-border">
          <div className="p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <span className="font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {activeSection === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-card-foreground">Edit Profile</h2>

              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser?.profilePic || "/placeholder.svg?height=80&width=80&query=user+profile"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Change Photo
                  </button>
                  <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleProfileChange("displayName", e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleProfileChange("username", e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell people about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleProfileChange("website", e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-card-foreground">Account Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="pt-4 border-t border-border">
                  <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors">
                    Delete Account
                  </button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-card-foreground">Privacy Settings</h2>

              <div className="space-y-4">
                {Object.entries(accountSettings).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                  >
                    <div>
                      <h3 className="font-medium text-card-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {key === "privateAccount" && "Only approved followers can see your posts"}
                        {key === "allowMessages" && "Allow others to send you direct messages"}
                        {key === "showOnlineStatus" && "Show when you're active"}
                        {key === "allowTagging" && "Allow others to tag you in posts"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAccountChange(key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-card-foreground">Notification Settings</h2>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                  >
                    <div>
                      <h3 className="font-medium text-card-foreground capitalize">{key} Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {key === "likes" && "Get notified when someone likes your posts"}
                        {key === "comments" && "Get notified when someone comments on your posts"}
                        {key === "follows" && "Get notified when someone follows you"}
                        {key === "messages" && "Get notified when you receive messages"}
                        {key === "posts" && "Get notified when people you follow post"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key, !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
