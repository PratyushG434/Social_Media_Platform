"use client"

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../service/api";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import PostCard from "./PostCard.jsx";
import { useChatStore } from "../store/useChatStore";
import { useNotifications } from "./Notification-system";

export default function Profile() {
  const { userId: paramId } = useParams();
  const userId = paramId ? parseInt(paramId, 10) : null;

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

  const { authUser } = useAuthStore();
  const { setSelectedUser, setTargetUserForChat } = useChatStore();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const isOwnProfile = !paramId || (authUser && authUser.user_id === userId);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);

  // Modals for followers / following
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // 🔒 Scroll lock when any modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;

    if (showFollowersModal || showFollowingModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [showFollowersModal, showFollowingModal]);

  // --- Fetch User Profile Data ---
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setUser(null);
    setUserPosts([]);

    try {
      // If own profile but not logged in → go login
      if (isOwnProfile && !authUser?.user_id) {
        if (!paramId) navigate("/login");
        return;
      }

      const targetId = isOwnProfile ? authUser?.user_id : userId;
      if (!targetId) {
        throw new Error("Target User ID is not valid.");
      }

      const response = isOwnProfile
        ? await API.getMyProfile()
        : await API.getUserProfile({ userId: targetId });

      if (!response?.isSuccess) {
        if (response?.code === 404) {
          return navigate("/404");
        }
        throw new Error("Failed to fetch user data.");
      }

      const userData = response.data.user || response.data;
      const userPostsData = userData.posts || [];
      const userFollowers = userData.followers || [];
      const userFollowing = userData.following || [];

      setUser(userData);

      const postsWithLikeStatus = userPostsData.map((p) => ({
        ...p,
        user_has_liked: p.user_has_liked || false,
      }));
      setUserPosts(postsWithLikeStatus);

      // Set follow states based on fresh data
      if (authUser && !isOwnProfile) {
        const currentAuthUserId = authUser.user_id;

        const isAuthUserFollowing =
          userFollowers.some((f) => f.user_id === currentAuthUserId) || false;
        setIsFollowing(isAuthUserFollowing);

        const doesTargetFollowMe =
          userFollowing.some((f) => f.user_id === currentAuthUserId) || false;
        setFollowsMe(doesTargetFollowMe);
      } else {
        setIsFollowing(false);
        setFollowsMe(false);
      }
    } catch (err) {
      console.error("Profile fetch error =>", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile, authUser, navigate, paramId]);

  // 🔁 Load whenever URL / auth changes
  useEffect(() => {
    if (!authUser && !paramId) {
      setLoading(false);
      setUser(null);
      navigate("/login");
      return;
    }

    if ((isOwnProfile && authUser?.user_id) || (!isOwnProfile && userId)) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [paramId, userId, authUser, isOwnProfile, fetchUserProfile, navigate]);

  // --- Follow / Unfollow (uses state isFollowing, avoids double-click) ---
  const handleFollowToggle = useCallback(async () => {
    if (!user || !authUser) return;

    const targetUserId = user.user_id;
    const wasFollowing = isFollowing; // old value

    // 1️⃣ Optimistic UI: update local state + followers list
    setIsFollowing(!wasFollowing);

    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const currentFollowers = prevUser.followers || [];
      let newFollowers;

      if (!wasFollowing) {
        // pehle follow nahi kar rahe the -> ab follow
        if (currentFollowers.some((f) => f.user_id === authUser.user_id)) {
          newFollowers = currentFollowers;
        } else {
          newFollowers = [
            ...currentFollowers,
            {
              user_id: authUser.user_id,
              username: authUser.username,
              display_name: authUser.display_name || authUser.username,
              profile_pic_url: authUser.profile_pic_url || null,
            },
          ];
        }
      } else {
        // pehle follow kar rahe the -> ab unfollow
        newFollowers = currentFollowers.filter(
          (f) => f.user_id !== authUser.user_id
        );
      }

      return { ...prevUser, followers: newFollowers };
    });

    // 2️⃣ API call
    try {
      const response = await API.toggleFollow({ userId: targetUserId });
      if (!response?.isSuccess) throw new Error("Failed to toggle follow status");

      // optional: server ka following flag mila to override
      if (response.data && typeof response.data.following === "boolean") {
        setIsFollowing(response.data.following);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);

      // 3️⃣ Error pe FULL revert
      setIsFollowing(wasFollowing);

      setUser((prevUser) => {
        if (!prevUser) return prevUser;

        const currentFollowers = prevUser.followers || [];
        let revertedFollowers;

        if (!wasFollowing) {
          // originally follow nahi kar rahe the -> revert: ensure removed
          revertedFollowers = currentFollowers.filter(
            (f) => f.user_id !== authUser.user_id
          );
        } else {
          // originally follow kar rahe the -> revert: ensure present
          if (currentFollowers.some((f) => f.user_id === authUser.user_id)) {
            revertedFollowers = currentFollowers;
          } else {
            revertedFollowers = [
              ...currentFollowers,
              {
                user_id: authUser.user_id,
                username: authUser.username,
                display_name: authUser.display_name || authUser.username,
                profile_pic_url: authUser.profile_pic_url || null,
              },
            ];
          }
        }

        return { ...prevUser, followers: revertedFollowers };
      });
    }
  }, [user, authUser, isFollowing]);

  // --- Message Button ---
  const handleSendMessage = async () => {
    if (!user) return;

    try {
      const res = await API.PostUserChats({
        targetUserId: user.user_id,
      });

      setSelectedUser({
        chat_id: res.data.chat.chat_id,
        _id: user.user_id,
        username: user.username,
        avatar: user.profile_pic_url || "/profile.jpg",
        email: user.email || "",
        isOnline: false,
      });

      navigate("/dashboard/messages");
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const handleMessageUser = () => {
    if (!user || !authUser) {
      addNotification({
        type: "warning",
        title: "Login Required",
        message: "You must be logged in to send messages.",
      });
      return;
    }

    if (user.user_id === authUser.user_id) {
      addNotification({
        type: "warning",
        title: "Self Chat",
        message: "Cannot message yourself.",
      });
      return;
    }

    setTargetUserForChat(user.user_id);
    navigate("/dashboard/messages");
  };

  // --- Like Toggle per Post ---
  const handleLikeToggle = (postId) => {
    setUserPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.post_id === postId) {
          const currentlyLiked = p.user_has_liked;
          return {
            ...p,
            user_has_liked: !currentlyLiked,
            likes_count: currentlyLiked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    API.toggleLike(postId).catch((err) => {
      console.error("Failed to sync like with server:", err);
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  // --- Not Found / Error State ---
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-xl font-bold text-destructive">Profile Not Found</h2>
        <p className="text-muted-foreground">
          The profile you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Go to Feed
        </button>
      </div>
    );
  }

  // --- Helper component for the Grid View (with Video Fix) ---
  const GridView = ({ posts }) => (
    <div className="grid grid-cols-3 gap-1">
      {posts.filter((p) => p.content_type !== "text" && p.media_url).length > 0 ? (
        posts
          .filter((p) => p.content_type !== "text" && p.media_url)
          .map((post) => (
            <div
              key={post.post_id}
              className="relative aspect-square group cursor-pointer"
              onClick={() => navigate(`/post/${post.post_id}`)}
            >
              {post.content_type === "video" ? (
                <video
                  src={post.media_url}
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={post.media_url || "/placeholder.svg"}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))
      ) : (
        <p className="text-center text-muted-foreground py-8 col-span-full">
          No media posts yet.
        </p>
      )}
    </div>
  );

  // --- Helper: List View ---
  const ListView = ({ posts, onLikeToggle }) => (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
            onLikeToggle={onLikeToggle}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8 col-span-full">
          No posts yet.
        </p>
      )}
    </div>
  );

  // Follow button style + label
  const followButtonClass = isFollowing
    ? "flex-1 bg-destructive text-destructive-foreground py-2 px-4 rounded-lg font-medium hover:bg-destructive/90 transition-colors"
    : "flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors";

  const followButtonLabel = isFollowing
    ? "Unfollow"
    : followsMe
    ? "Follow Back"
    : "Follow";

  // --- Main JSX ---
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-semibold text-card-foreground">
            @{user.username}
          </h1>

          {isOwnProfile ? (
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="ml-auto text-muted-foreground hover:text-card-foreground transition-colors"
            >
              <span className="text-xl">⚙️</span>
            </button>
          ) : (
            <div className="w-6 ml-auto" />
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start space-x-4 mb-6">
          <Avatar
            src={user.profile_pic_url}
            name={user.display_name || user.username}
            className="w-20 h-20"
          />

          <div className="flex-1">
            <h2 className="text-xl font-bold text-card-foreground">
              {user.display_name || user.username}
            </h2>
            <p className="text-muted-foreground mb-3">
              {user.bio || "No bio yet."}
            </p>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              {/* Posts */}
              <div className="text-center">
                <p className="font-bold text-card-foreground">
                  {userPosts.length}
                </p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>

              {/* Followers */}
              <button
                type="button"
                onClick={() => setShowFollowersModal(true)}
                className="text-center hover:text-card-foreground transition-colors"
              >
                <p className="font-bold text-card-foreground">
                  {user.followers?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>

              {/* Following */}
              <button
                type="button"
                onClick={() => setShowFollowingModal(true)}
                className="text-center hover:text-card-foreground transition-colors"
              >
                <p className="font-bold text-card-foreground">
                  {user.following?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            {/* Buttons */}
            <div className="flex space-x-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => navigate("/dashboard/settings")}
                    className="flex-1 bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button className="bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
                    Share Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollowToggle}
                    className={followButtonClass}
                  >
                    {followButtonLabel}
                  </button>

                  <button
                    onClick={handleMessageUser}
                    className="bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    Message
                  </button>
                </>
              )}
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

        {/* View Mode Toggle */}
        {activeTab === "posts" && userPosts.length > 0 && (
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4zM5 4H4v12h1V4zM15 4h1v12h-1V4z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h4v4H5V5zm6 0h4v4h-4V5zm-6 6h4v4H5v-4zm6 0h4v4h-4v-4z" />
              </svg>
            </button>
          </div>
        )}

        {/* Posts Content */}
        {activeTab === "posts" && (
          <div className="flex flex-col">
            {userPosts.length > 0 ? (
              <>
                {viewMode === "list" && (
                  <ListView posts={userPosts} onLikeToggle={handleLikeToggle} />
                )}
                {viewMode === "grid" && <GridView posts={userPosts} />}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8 col-span-full">
                No posts yet.
              </p>
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

      {/* Followers Modal */}
      {showFollowersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFollowersModal(false);
          }}
        >
          <div className="bg-card border border-border w-[90%] max-w-sm sm:max-w-md md:max-w-lg rounded-2xl shadow-xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold">Followers</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-muted-foreground hover:text-card-foreground"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-2 py-2">
              {user.followers && user.followers.length > 0 ? (
                user.followers.map((follower) => (
                  <button
                    key={follower.user_id}
                    type="button"
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/dashboard/profile/${follower.user_id}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-left"
                  >
                    <Avatar
                      src={follower.profile_pic_url}
                      name={follower.display_name || follower.username}
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        @{follower.username}
                      </span>
                      {follower.display_name && (
                        <span className="text-xs text-muted-foreground">
                          {follower.display_name}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No followers yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFollowingModal(false);
          }}
        >
          <div className="bg-card border border-border w-[90%] max-w-sm sm:max-w-md md:max-w-lg rounded-2xl shadow-xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-base font-semibold">Following</h2>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-muted-foreground hover:text-card-foreground"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-2 py-2">
              {user.following && user.following.length > 0 ? (
                user.following.map((u) => (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/dashboard/profile/${u.user_id}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-left"
                  >
                    <Avatar
                      src={u.profile_pic_url}
                      name={u.display_name || u.username}
                      className="w-8 h-8"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">@{u.username}</span>
                      {u.display_name && (
                        <span className="text-xs text-muted-foreground">
                          {u.display_name}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                  Not following anyone yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
