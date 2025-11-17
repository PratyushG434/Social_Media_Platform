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

  // Fetch user data on load
  useEffect(() => {
    if (!authUser?.user_id) return;
    const fetchUser = async () => {
      try {
        const res = await API.getMyProfile();
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
      formData.append("username", profileData.username); // not editable, but still sent
      formData.append("bio", profileData.bio || "");
      formData.append("email", profileData.email); // not editable, but still sent
      formData.append(
        "dob",
        profileData.dob ? formatDateToISO(profileData.dob) : ""
      );
      formData.append("phone", profileData.phone || "");
      formData.append("website", profileData.website || "");
      if (selectedFile) formData.append("profile_pic", selectedFile);

      const userID = profileData.user_id;

      const res = await API.updateMyProfile({ userID, formData });
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
          <h1 className="text-xl font-semibold text-card-foreground">
            Settings
          </h1>
          <span />
        </div>
      </div>

      {/* Only Edit Profile Section */}
      <div className="p-4 space-y-6">
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

          {/* Username - visible but not editable */}
          <InputField
            label="Username"
            value={profileData.username || ""}
            disabled
            onChange={() => {}}
          />

          <InputField
            label="Date of Birth"
            type="date"
            value={profileData.dob || ""}
            onChange={(e) => handleProfileChange("dob", e.target.value)}
          />

          <TextareaField
            label="Bio"
            value={profileData.bio || ""}
            onChange={(e) => handleProfileChange("bio", e.target.value)}
          />

          {/* Website field replaced by Email (non-editable) */}
          <InputField
            label="Email"
            type="email"
            value={profileData.email || ""}
            disabled
            onChange={() => {}}
          />
        </div>

        <button
          onClick={handleProfileSubmit}
          className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {uploading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

// Small reusable UI Components
function InputField({ label, type = "text", value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
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

export default function Settings() {
  return (
    <NotificationProvider>
      <SettingsContent />
    </NotificationProvider>
  );
}
