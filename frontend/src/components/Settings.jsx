"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import API from "../service/api";
import { NotificationProvider, useNotifications } from "./Notification-system";

// 🔹 Helper functions for DOB format
function formatDateForInput(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateToISO(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString + "T00:00:00");
  return d.toISOString();
}

const SettingsContent = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { addNotification } = useNotifications();

  const [activeSection, setActiveSection] = useState("profile");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [profileData, setProfileData] = useState({
    user_id: authUser?.user_id,
    display_name: authUser?.display_name || "",
    username: authUser?.username || "",
    bio: authUser?.bio || "",
    email: authUser?.email || "",
    dob: "",
    phone: "",
    website: "",
    profile_pic_url: "",
  });

  const [accountSettings, setAccountSettings] = useState({
    privateAccount: false,
    allowMessages: true,
    showOnlineStatus: true,
    allowTagging: true,
  });

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    posts: false,
  });

  // Fetch user data on load
  useEffect(() => {
    if (!authUser?.user_id) return;
    const fetchUser = async () => {
      try {
        const res = await API.getUserProfile({userId :authUser.user_id});
        const user = res.user ?? res.data?.user;
        if (!user) throw new Error("User not found");

        setProfileData((prev) => ({
          ...prev,
          ...user,
          dob: formatDateForInput(user.dob),
        }));
      } catch (err) {
        console.error("Profile fetch error:", err);
        addNotification({
          type: "error",
          title: "Fetch Failed",
          message: err.message,
        });
      }
    };
    fetchUser();
  }, [authUser, addNotification]);

  // Handlers
  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (field, value) => {
    setAccountSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  // 🟡 Handle photo select
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addNotification({
        type: "error",
        title: "Invalid File",
        message: "Please select a valid image file",
      });
      return;
    }
    setSelectedFile(file);
    // show preview instantly
    const previewUrl = URL.createObjectURL(file);
    setProfileData((p) => ({ ...p, profile_pic_url: previewUrl }));
  };

  // 🟢 Handle Save Profile (with image upload inside)
const handleProfileSubmit = async () => {
  try {
    setUploading(true);

    const formData = new FormData();
    formData.append("display_name", profileData.display_name);
    formData.append("username", profileData.username);
    formData.append("bio", profileData.bio || "");
    formData.append("email", profileData.email);
    formData.append("dob", profileData.dob ? formatDateToISO(profileData.dob) : "");
    formData.append("phone", profileData.phone || "");
    formData.append("website", profileData.website || "");
    if (selectedFile) formData.append("profile_pic", selectedFile);

    const userID = profileData.user_id;
    
    const res = await API.updateMyProfile({userID, formData});
    const user = res.user ?? res.data?.user;
    if (!user) throw new Error("Failed to update");

    setProfileData((prev) => ({
      ...prev,
      ...user,
      dob: formatDateForInput(user.dob),
    }));

    addNotification({
      type: "success",
      title: "Profile Updated",
      message: "Profile and photo saved successfully!",
    });
  } catch (err) {
    console.error(err);
    addNotification({
      type: "error",
      title: "Update Failed",
      message: err.message,
    });
  } finally {
    setUploading(false);
  }
};

  const handleAccountSubmit = async () => {
    try {
      await API.updateAccountSettings(accountSettings);
      addNotification({
        type: "success",
        title: "Account Updated",
        message: "Account & privacy settings saved!",
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to Save",
        message: err.message,
      });
    }
  };

  const handleNotificationSubmit = async () => {
    try {
      await API.updateNotificationSettings(notifications);
      addNotification({
        type: "success",
        title: "Notifications Updated",
        message: "Notification preferences saved!",
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to Save",
        message: err.message,
      });
    }
  };

  const sections = [
    { id: "profile", title: "Edit Profile", icon: "👤" },
    { id: "account", title: "Account & Privacy", icon: "⚙️" },
    { id: "notifications", title: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-semibold text-card-foreground">Settings</h1>
          <span />
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

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* 🟢 PROFILE */}
          {activeSection === "profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={
                    profileData?.profile_pic_url ||
                    "/placeholder.svg?height=80&width=80&query=user+profile"
                  }
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-input"
                    />
                    <button
                      onClick={() =>
                        document.getElementById("photo-input")?.click()
                      }
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {uploading ? "Uploading..." : "Change Photo"}
                    </button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Display Name"
                  value={profileData.display_name || ""}
                  onChange={(e) =>
                    handleProfileChange("display_name", e.target.value)
                  }
                />
                <InputField
                  label="Username"
                  value={profileData.username || ""}
                  onChange={(e) =>
                    handleProfileChange("username", e.target.value)
                  }
                />
                <InputField
                  label="Date of Birth"
                  type="date"
                  value={profileData.dob || ""}
                  onChange={(e) =>
                    handleProfileChange("dob", e.target.value)
                  }
                />
                <TextareaField
                  label="Bio"
                  value={profileData.bio || ""}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                />
                <InputField
                  label="Website"
                  type="url"
                  value={profileData.website || ""}
                  onChange={(e) =>
                    handleProfileChange("website", e.target.value)
                  }
                />
              </div>

              <button
                onClick={handleProfileSubmit}
                className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {uploading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}

          {/* 🔒 ACCOUNT */}
          {activeSection === "account" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Account & Privacy</h2>

              <div className="space-y-4">
                <InputField
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    handleProfileChange("email", e.target.value)
                  }
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    handleProfileChange("phone", e.target.value)
                  }
                />
              </div>

              <div className="mt-6 space-y-4">
                {Object.entries(accountSettings).map(([key, value]) => (
                  <ToggleSwitch
                    key={key}
                    title={key.replace(/([A-Z])/g, " $1").trim()}
                    desc={
                      {
                        privateAccount:
                          "Only approved followers can see your posts",
                        allowMessages:
                          "Allow others to send you direct messages",
                        showOnlineStatus: "Show when you're active",
                        allowTagging: "Allow others to tag you in posts",
                      }[key]
                    }
                    value={value}
                    onToggle={() => handleAccountChange(key, !value)}
                  />
                ))}
              </div>

              <button
                onClick={handleAccountSubmit}
                className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Account & Privacy
              </button>
            </div>
          )}

          {/* 🔔 NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Notification Settings
              </h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <ToggleSwitch
                    key={key}
                    title={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    desc={
                      {
                        likes: "Get notified when someone likes your posts",
                        comments:
                          "Get notified when someone comments on your posts",
                        follows:
                          "Get notified when someone follows your account",
                        messages:
                          "Get notified when you receive new messages",
                        posts:
                          "Get notified when people you follow post",
                      }[key]
                    }
                    value={value}
                    onToggle={() =>
                      handleNotificationChange(key, !value)
                    }
                  />
                ))}
              </div>

              <button
                onClick={handleNotificationSubmit}
                className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Small reusable UI Components
function InputField({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
      />
    </div>
  );
}

function ToggleSwitch({ title, desc, value, onToggle }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
      <div>
        <h3 className="font-medium text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onToggle}
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
  );
}

export default function Settings() {
  return (
    <NotificationProvider>
      <SettingsContent />
    </NotificationProvider>
  );
}
