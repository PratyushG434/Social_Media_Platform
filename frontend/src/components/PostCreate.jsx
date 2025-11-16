"use client";

import { useState, useEffect } from "react";
import API from "../service/api";
import { useNotifications } from "./Notification-system";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import mapIcon from "../assets/icons/maps-and-flags.png";
import cameraIcon from "../assets/icons/image.png";
import timerIcon from "../assets/icons/sand-clock.png";

export default function PostCreate() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" | "video" | null
  const [isPosting, setIsPosting] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const { addNotification } = useNotifications();
  const { authUser } = useAuthStore();

  const [taggedUsers, setTaggedUsers] = useState([]); // Array of user objects
  const [tagQuery, setTagQuery] = useState("");
  const [tagSearchResults, setTagSearchResults] = useState([]);
  const [showTagSearch, setShowTagSearch] = useState(false);
  // Search users for tagging
  useEffect(() => {
    if (!tagQuery.trim()) {
      setTagSearchResults([]);
      setShowTagSearch(false);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const response = await API.searchUsers({ searchQuery: tagQuery });
        if (response?.isSuccess) {
          // Exclude already tagged users
          setTagSearchResults(
            response.data.filter(
              (u) => !taggedUsers.some((tu) => tu.user_id === u.user_id)
            )
          );
          setShowTagSearch(true);
        }
      } catch {
        setTagSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [tagQuery, taggedUsers]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);

      if (file.type.startsWith("video")) {
        setMediaType("video");
      } else {
        setMediaType("image");
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=e9ff163643b44c78932108699598026b`
      );

      const data = await res.json();
      if (data?.results?.length > 0) {
        return data.results[0].formatted; // readable location name
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };

  const handleAddLocation = () => {
    if (!navigator.geolocation) {
      addNotification?.({
        type: "error",
        title: "Location Error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const placeName = await reverseGeocode(latitude, longitude);

        if (placeName) {
          const locationText = `📍 ${placeName}`;
          setContent((prev) =>
            prev ? prev + "\n" + locationText : locationText
          );
        } else {
          const locationText = `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )}`;
          setContent((prev) =>
            prev ? prev + "\n" + locationText : locationText
          );
        }

        setIsGettingLocation(false);
      },
      (error) => {
        addNotification?.({
          type: "error",
          title: "Location Error",
          message: error?.message || "Unable to fetch your location.",
        });
        setIsGettingLocation(false);
      }
    );
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    try {
      setIsPosting(true);
      const formData = new FormData();
      // File
      if (mediaFile) {
        formData.append("content", mediaFile);
      }
      // Text
      formData.append("content", content.trim());
      // Determine content type
      let contentType = "text";
      if (mediaFile) {
        contentType = mediaFile.type.startsWith("video") ? "video" : "image";
      }
      formData.append("content_type", contentType);
      // Add tags (array of user IDs)
      if (taggedUsers.length > 0) {
        taggedUsers.forEach((u, idx) => {
          formData.append(`tags[${idx}]`, u.user_id);
        });
      }
      const response = await API.createPost(formData);
      if (!response?.isSuccess) throw new Error("Failed to create post");
      addNotification?.({
        type: "success",
        title: "Post Created",
        message: "Your post was successfully uploaded!",
      });
      setContent("");
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      setTaggedUsers([]);
      setTagQuery("");
    } catch (err) {
      addNotification?.({
        type: "error",
        title: "Post Failed",
        message: err?.message || "Something went wrong",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

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
          <h1 className="text-xl font-semibold text-card-foreground">
            Create Post
          </h1>
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
            <Avatar
              src={authUser?.profile_pic_url}
              name={authUser?.display_name || authUser?.username}
              className="w-10 h-10"
            />
            <div>
              <p className="font-semibold text-card-foreground">
                {authUser?.display_name || authUser?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                @{authUser?.username}
              </p>
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

            {/* Tag Users */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Tag users:
              </label>
              <input
                type="text"
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Search users to tag..."
                className="w-full px-2 py-1 border rounded mb-2"
                onFocus={() => setShowTagSearch(true)}
              />
              {showTagSearch && tagSearchResults.length > 0 && (
                <div className="border rounded bg-background shadow p-2 max-h-40 overflow-y-auto z-20 absolute">
                  {tagSearchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-primary/10 px-2 rounded"
                      onClick={() => {
                        setTaggedUsers([...taggedUsers, user]);
                        setTagQuery("");
                        setShowTagSearch(false);
                      }}
                    >
                      <Avatar
                        src={user.profile_pic_url}
                        name={user.display_name || user.username}
                        className="w-6 h-6"
                      />
                      <span>{user.display_name || user.username}</span>
                      <span className="text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* Show tagged users */}
              {taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {taggedUsers.map((user) => (
                    <span
                      key={user.user_id}
                      className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-sm"
                    >
                      <Avatar
                        src={user.profile_pic_url}
                        name={user.display_name || user.username}
                        className="w-5 h-5"
                      />
                      {user.display_name || user.username}
                      <button
                        type="button"
                        className="ml-1 text-xs text-red-500 hover:text-red-700"
                        onClick={() =>
                          setTaggedUsers(
                            taggedUsers.filter(
                              (u) => u.user_id !== user.user_id
                            )
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-4">
                {mediaType === "video" ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-80 rounded-lg object-contain"
                  />
                ) : (
                  <img
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full max-h-80 object-cover rounded-lg"
                  />
                )}

                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  ×
                </button>
              </div>
            )}

            {/* Media Upload / Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                {/* Media picker */}
                <label className="cursor-pointer text-muted-foreground hover:text-card-foreground transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <img
                    src={cameraIcon}
                    alt="Photo / Video"
                    className="w-5 h-5 object-contain"
                  />
                </label>

                {/* Emoji button */}
                <button
                  type="button"
                  className="relative text-muted-foreground hover:text-card-foreground transition-colors"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <span className="text-xl">😊</span>
                </button>

                {/* Location button */}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
                  onClick={handleAddLocation}
                  disabled={isGettingLocation}
                >
                  <img
                    src={isGettingLocation ? timerIcon : mapIcon}
                    alt="Location"
                    className="w-5 h-5 object-contain"
                  />
                </button>
              </div>

              <div className="text-sm text-muted-foreground">
                {content.length}/280
              </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-2 p-2 border border-border rounded-lg bg-background flex flex-wrap gap-2">
                {[
                  "😀",
                  "😅",
                  "😂",
                  "😍",
                  "😎",
                  "🤔",
                  "😭",
                  "🙏",
                  "🔥",
                  "🎉",
                  "❤️",
                  "👍",
                ].map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    className="text-2xl hover:scale-110 transition-transform"
                    onClick={() => handleAddEmoji(emo)}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
