"use client";

import { useState, useEffect, useRef } from "react";
import API from "../service/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";

export default function StoryViewer() {
  const [storiesData, setStoriesData] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const [likedStories, setLikedStories] = useState(new Set());
  const [isPaused, setIsPaused] = useState(false);

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [storyReactions, setStoryReactions] = useState([]);
  const [storyLikes, setStoryLikes] = useState([]);

  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { userIds = [] } = location.state || {};

  const { authUser } = useAuthStore();
  const videoRef = useRef(null);

  // ✅ Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        if (!userIds.length) return;

        const allUsersStories = [];
        for (const userId of userIds) {
          const response = await API.getUserStories(userId);
          if (response?.isSuccess && response.data?.stories?.length) {
            const userStories = response.data.stories;
            const first = userStories[0];
            allUsersStories.push({
              userId,
              user: {
                username: first.username,
                displayName: first.display_name || first.username,
                profilePic: first.profile_pic_url,
              },
              stories: userStories.map((s) => ({
                id: s.story_id,
                mediaUrl: s.media_url,
                contentType: s.content_type,
                content: s.content, // <-- map text content
                timestamp: new Date(s.timestamp).toLocaleString(),
                duration: 5000,
              })),
            });
          }
        }

        setStoriesData(allUsersStories);
      } catch (err) {
        console.error("Error fetching user stories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [userIds]);

  const currentUserStories = storiesData[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];
  const isOwner =
    authUser &&
    currentUserStories &&
    authUser.user_id === currentUserStories.userId;

  // 🔁 Auto progress
  useEffect(() => {
    if (!currentStory) return;
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (currentStory.duration / 100);
        if (newProgress >= 100) {
          handleNextStory();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory, currentStoryIndex, currentUserIndex, isPaused]);

  // 🔹 Reactions fetch
  useEffect(() => {
    if (!currentStory) {
      setStoryReactions([]);
      return;
    }

    const rawId = currentStory.id;
    const storyId = Number(rawId);

    if (!Number.isFinite(storyId) || storyId <= 0) {
      console.error("Invalid storyId for reactions fetch:", rawId);
      setStoryReactions([]);
      return;
    }

    const fetchReactions = async () => {
      try {
        const reactionsRes = await API.getStoryReactions({ storyId });
        console.log("Story reactions response:", reactionsRes);

        const reactionsData =
          reactionsRes?.data?.reactions ||
          reactionsRes?.reactions ||
          reactionsRes?.data ||
          [];

        setStoryReactions(Array.isArray(reactionsData) ? reactionsData : []);
      } catch (err) {
        console.error("Error fetching story reactions:", err);
        setStoryReactions([]);
      }
    };

    fetchReactions();
  }, [currentStory?.id]);

  // 🔹 Likes fetch
  useEffect(() => {
    if (!currentStory) {
      setStoryLikes([]);
      return;
    }

    const rawId = currentStory.id;
    const storyId = Number(rawId);

    if (!Number.isFinite(storyId) || storyId <= 0) {
      console.error("Invalid storyId for likes fetch:", rawId);
      setStoryLikes([]);
      return;
    }

    const fetchLikes = async () => {
      try {
        const likesRes = await API.getStoryLikes({ storyId });
        console.log("Story likes response:", likesRes);

        const likesData =
          likesRes?.data?.likes || likesRes?.likes || likesRes?.data || [];

        setStoryLikes(Array.isArray(likesData) ? likesData : []);
      } catch (err) {
        console.error("Error fetching story likes:", err);
        setStoryLikes([]);
      }
    };

    fetchLikes();
  }, [currentStory?.id]);

  const handleNextStory = () => {
    if (!currentUserStories) return;
    setIsPaused(false);

    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentUserIndex < storiesData.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      navigate("/dashboard");
    }
  };

  const handlePrevStory = () => {
    if (!currentUserStories) return;
    setIsPaused(false);

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserStories = storiesData[currentUserIndex - 1];
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(prevUserStories.stories.length - 1);
      setProgress(0);
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (currentStory?.contentType === "video" && videoRef.current) {
        if (next) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  };

  // helper: resume playback
  const resumeStory = () => {
    setIsPaused(false);
    if (currentStory?.contentType === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // ✅ Like / Unlike
  const handleToggleLike = async () => {
    if (!currentStory) return;
    const storyId = currentStory.id;
    const isCurrentlyLiked = likedStories.has(storyId);

    const updatedLikes = new Set(likedStories);
    if (isCurrentlyLiked) updatedLikes.delete(storyId);
    else updatedLikes.add(storyId);
    setLikedStories(updatedLikes);

    try {
      const response = await API.toggleStoryLike({ storyId });
      if (!response?.isSuccess) throw new Error("Failed to toggle story like");

      const { liked } = response.data;
      const newLikes = new Set(updatedLikes);
      if (liked) newLikes.add(storyId);
      else newLikes.delete(storyId);
      setLikedStories(newLikes);
    } catch (err) {
      console.error("Error toggling story like:", err);
    }
  };

  // ✅ Send reaction
  const handleReaction = async (emoji) => {
    if (!currentStory) return;
    setShowReactionPicker(false);

    const emojiToReactionMap = {
      "❤️": "heart",
      "😂": "laugh",
      "😮": "surprised",
      "😢": "sad",
      "😡": "angry",
      "👍": "like",
    };

    const reactionType = emojiToReactionMap[emoji] || "unknown";

    try {
      const response = await API.reactToStory({
        storyId: currentStory.id,
        reaction: reactionType,
      });
      if (!response?.isSuccess) throw new Error("Failed to react to story");

      console.log("Reaction sent:", response.data.reaction);
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  };

  const reactionEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  const typeToEmojiMap = {
    heart: "❤️",
    laugh: "😂",
    surprised: "😮",
    sad: "😢",
    angry: "😡",
    like: "👍",
  };

  // 🎛️ Modals open/close
  const openReactionsModal = () => {
    setShowReactionsModal(true);
    setIsPaused(true);
    if (currentStory?.contentType === "video" && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeReactionsModal = () => {
    setShowReactionsModal(false);
    resumeStory();
  };

  const openLikesModal = () => {
    setShowLikesModal(true);
    setIsPaused(true);
    if (currentStory?.contentType === "video" && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeLikesModal = () => {
    setShowLikesModal(false);
    resumeStory();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <p>Loading stories...</p>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <p>No stories available</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const isLiked = likedStories.has(currentStory.id);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
        {currentUserStories.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width:
                  index < currentStoryIndex
                    ? "100%"
                    : index === currentStoryIndex
                    ? `${progress}%`
                    : "0%",
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
            <button
              className="text-white font-semibold text-sm"
              onClick={() =>
                navigate(`/dashboard/profile/${currentUserStories.userId}`)
              }
            >
              {currentUserStories.user.displayName}
            </button>
            <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pause button */}
          <button
            onClick={togglePause}
            className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium text-white hover:bg-white/25 transition-colors"
          >
            {isPaused ? "Play" : "Pause"}
          </button>

          {/* Delete story button (only for owner) */}
          {isOwner && (
            <button
              onClick={async () => {
                if (!currentStory) return;
                if (
                  !window.confirm("Delete this story? This cannot be undone.")
                )
                  return;
                try {
                  await API.deleteStory(currentStory.id);
                  // Remove story from UI
                  const updatedStories = [...currentUserStories.stories];
                  updatedStories.splice(currentStoryIndex, 1);
                  if (updatedStories.length === 0) {
                    // Remove user from storiesData
                    const newStoriesData = [...storiesData];
                    newStoriesData.splice(currentUserIndex, 1);
                    setStoriesData(newStoriesData);
                    setCurrentUserIndex(Math.max(0, currentUserIndex - 1));
                    setCurrentStoryIndex(0);
                  } else {
                    // Update stories for current user
                    const newStoriesData = [...storiesData];
                    newStoriesData[currentUserIndex] = {
                      ...currentUserStories,
                      stories: updatedStories,
                    };
                    setStoriesData(newStoriesData);
                    setCurrentStoryIndex(Math.max(0, currentStoryIndex - 1));
                  }
                } catch (err) {
                  alert("Failed to delete story.");
                  console.error("Error deleting story:", err);
                }
              }}
              className="px-3 py-1 rounded-full bg-red-600 text-xs font-medium text-white hover:bg-red-700 transition-colors"
              title="Delete story"
            >
              Delete
            </button>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="text-white hover:text-white/70 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
      </div>

      {/* Story content: always show text if present, plus image/video if present */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Text content (if any) */}
        {currentStory.content && (
          <div className="mb-4 px-6 py-4 text-white text-lg text-center break-words max-w-2xl bg-black/40 rounded-xl shadow-lg">
            {currentStory.content}
          </div>
        )}
        {/* Video */}
        {currentStory.contentType === "video" && currentStory.mediaUrl && (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            autoPlay
            muted
            className="max-w-full max-h-[60vh] object-contain mb-2"
          />
        )}
        {/* Image */}
        {currentStory.contentType === "image" && currentStory.mediaUrl && (
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="max-w-full max-h-[60vh] object-contain mb-2"
          />
        )}
        {/* Navigation areas */}
        <button
          onClick={handlePrevStory}
          className="absolute left-0 top-0 w-1/3 h-full z-10"
        />
        <button
          onClick={handleNextStory}
          className="absolute right-0 top-0 w-1/3 h-full z-10"
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between">
          {/* LEFT: Like + Reaction send (ek side) */}
          <div className="flex items-center gap-4">
            {/* Like Button ❤️ */}
            <button
              onClick={handleToggleLike}
              className={`text-3xl transition-transform ${
                isLiked
                  ? "scale-110 text-red-500"
                  : "text-white hover:scale-110"
              }`}
            >
              {isLiked ? "❤️" : "🤍"}
            </button>

            {/* Emoji picker toggle (send reaction) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReactionPicker((prev) => !prev)}
                className="text-white hover:text-white/70 transition-colors"
              >
                <span className="text-2xl">😊</span>
              </button>

              {showReactionPicker && (
                <div className="flex gap-2 bg-white/10 rounded-full px-3 py-1">
                  {reactionEmojis.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => handleReaction(emo)}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Reactions view + Likes view (dusri side) */}
          <div className="flex items-center gap-4">
            {/* Reactions button (sab ke liye) */}
            <button
              type="button"
              onClick={openReactionsModal}
              className="relative text-white/80 hover:text-white flex items-center"
            >
              {/* Icon + badge wrapper */}
              <span className="relative inline-flex items-center justify-center">
                <span className="text-2xl">💬</span>

                {storyReactions.length > 0 && (
                  <span
                    className="
            absolute -top-1 -right-2 
            min-w-[18px] h-[18px]
            flex items-center justify-center
            rounded-full text-[10px] font-semibold
            bg-red-500 text-white
            px-1
          "
                  >
                    {storyReactions.length}
                  </span>
                )}
              </span>
            </button>

            {/* Likes button – sirf owner ke liye */}
            {isOwner && (
              <button
                type="button"
                onClick={openLikesModal}
                className="relative text-white/80 hover:text-white flex items-center"
              >
                <span className="relative inline-flex items-center justify-center">
                  <span className="text-2xl">❤️</span>

                  {storyLikes.length > 0 && (
                    <span
                      className="
              absolute -top-1 -right-2 
              min-w-[18px] h-[18px]
              flex items-center justify-center
              rounded-full text-[10px] font-semibold
              bg-red-500 text-white
              px-1
            "
                    >
                      {storyLikes.length}
                    </span>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Likes modal (only for owner) */}
      {isOwner && showLikesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLikesModal();
          }}
        >
          <div
            className="bg-card text-card-foreground w-[90%] max-w-sm rounded-2xl shadow-xl max-h-[70vh] flex flex-col border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold">Story Likes</h2>
              <button
                onClick={closeLikesModal}
                className="text-muted-foreground hover:text-card-foreground"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-2 py-2">
              {storyLikes.length > 0 ? (
                storyLikes.map((like) => (
                  <div
                    key={like.like_id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted"
                  >
                    <Avatar
                      src={like.profile_pic_url}
                      name={like.display_name || like.username}
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {like.display_name || like.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{like.username}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No likes yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reactions modal (sab users ke liye) */}
      {showReactionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReactionsModal();
          }}
        >
          <div
            className="bg-card text-card-foreground w-[90%] max-w-sm rounded-2xl shadow-xl max-h-[70vh] flex flex-col border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold">Story Reactions</h2>
              <button
                onClick={closeReactionsModal}
                className="text-muted-foreground hover:text-card-foreground"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-2 py-2">
              {storyReactions.length > 0 ? (
                storyReactions.map((r) => (
                  <div
                    key={r.reaction_id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted"
                  >
                    <Avatar
                      src={r.profile_pic_url}
                      name={r.display_name || r.username}
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {r.display_name || r.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{r.username}
                        </span>
                      </div>
                      <span className="text-lg">
                        {typeToEmojiMap[r.reaction] || "💬"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No reactions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
