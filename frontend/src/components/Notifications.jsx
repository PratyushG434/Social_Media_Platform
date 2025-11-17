"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import API from "../service/api";
import { useNotifications as useToast } from "./Notification-system";
import Avatar from "./Avatar";

import {
  formatDistanceToNow,
  isToday,
  isThisWeek,
  parseISO,
} from "date-fns";

import { RefreshCw } from "lucide-react";

function TaggedNotificationItem({ post, navigate }) {
  return (
    <div
      className="flex items-center space-x-4 p-4 border-b border-border cursor-pointer hover:bg-muted"
      onClick={() => navigate(`/post/${post.post_id}`)}
    >
      <Avatar
        src={post.profile_pic_url}
        name={post.display_name || post.username}
        className="w-11 h-11"
      />
      <div className="flex-1">
        <p className="font-semibold text-card-foreground">
          You have been tagged in a post by{" "}
          {post.display_name || post.username}
        </p>
        <p className="text-muted-foreground text-sm">{post.content}</p>
        <p className="text-xs text-primary mt-1">
          {new Date(post.timestamp).toLocaleString()}
        </p>
      </div>
      {post.media_url && (
        <img
          src={post.media_url}
          alt="Post preview"
          className="w-14 h-14 rounded-md object-cover"
        />
      )}
    </div>
  );
}

const groupNotificationsByDate = (notifications) => {
  const groups = { Today: [], "This Week": [], Earlier: [] };

  notifications.forEach((n) => {
    if (!n.timestamp || typeof n.timestamp !== "string") {
      groups.Earlier.push(n);
      return;
    }

    try {
      const date = parseISO(n.timestamp);
      if (isToday(date)) groups.Today.push(n);
      else if (isThisWeek(date, { weekStartsOn: 1 }))
        groups["This Week"].push(n);
      else groups.Earlier.push(n);
    } catch {
      groups.Earlier.push(n);
    }
  });

  if (groups.Today.length === 0) delete groups.Today;
  if (groups["This Week"].length === 0) delete groups["This Week"];
  if (groups.Earlier.length === 0) delete groups.Earlier;

  return groups;
};

const NotificationSkeleton = () => (
  <div className="flex items-start space-x-4 p-4 animate-pulse">
    <div className="w-11 h-11 bg-muted rounded-full"></div>
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/4"></div>
    </div>
    <div className="w-14 h-14 bg-muted rounded-md"></div>
  </div>
);

function NotificationItem({
  notification,
  navigate,
  setNotifications,
  addNotification,
}) {
  const { authUser } = useAuthStore();

  const [isFollowing, setIsFollowing] = useState(
    typeof notification.isFollowing === "boolean"
      ? notification.isFollowing
      : false
  );

  const [loadingFollow, setLoadingFollow] = useState(false);

  const handleItemClick = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    if (notification.type === "follow") {
      navigate(`/dashboard/profile/${notification.user.id}`);
    } else if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  const handleFollowToggle = async (e) => {
    e.stopPropagation();

    if (!authUser) {
      return addNotification({
        type: "warning",
        title: "Login Required",
        message: "Please login to follow users.",
      });
    }

    const prev = isFollowing;
    const targetId = notification.user.id;

    // Optimistic UI
    setIsFollowing(!prev);

    setNotifications((prevList) =>
      prevList.map((n) =>
        n.id === notification.id ? { ...n, isFollowing: !prev } : n
      )
    );

    try {
      setLoadingFollow(true);
      const res = await API.toggleFollow({ userId: targetId });

      const backendFollow =
        typeof res.data.following === "boolean"
          ? res.data.following
          : !prev;

      setIsFollowing(backendFollow);

      setNotifications((prevList) =>
        prevList.map((n) =>
          n.id === notification.id
            ? { ...n, isFollowing: backendFollow }
            : n
        )
      );
    } catch (err) {
      setIsFollowing(prev);

      setNotifications((prevList) =>
        prevList.map((n) =>
          n.id === notification.id ? { ...n, isFollowing: prev } : n
        )
      );

      addNotification({
        type: "error",
        title: "Follow Failed",
        message: "Could not update follow status.",
      });
    } finally {
      setLoadingFollow(false);
    }
  };

  const followLabel = isFollowing ? "Unfollow" : "Follow Back";

  const followClass = isFollowing
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : "bg-primary text-primary-foreground hover:bg-primary/90";

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  const timeDisplay = notification.timestamp
    ? formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })
    : "N/A";

  return (
    <div
      onClick={handleItemClick}
      className={`flex items-start space-x-4 p-4 transition-colors cursor-pointer ${
        !notification.isRead
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={notification.user.profilePic}
          name={notification.user.displayName}
          className="w-11 h-11"
        />
        <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-1 border border-border shadow-sm">
          <span className="text-xs">{getIcon(notification.type)}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-card-foreground">
          <span className="font-semibold">{notification.user.displayName}</span>
          <span className="text-muted-foreground">
            {" "}
            {notification.content}
          </span>
        </p>
        <p className="text-sm text-primary font-medium mt-1">{timeDisplay}</p>
      </div>

      <div className="flex-shrink-0 self-center">
        {notification.postPreview ? (
          <img
            src={notification.postPreview}
            alt="Preview"
            className="w-14 h-14 rounded-md object-cover"
          />
        ) : notification.type === "follow" ? (
          <button
            onClick={handleFollowToggle}
            disabled={loadingFollow}
            className={`${followClass} px-4 py-2 rounded-lg text-sm font-medium transition-all`}
          >
            {loadingFollow ? "..." : followLabel}
          </button>
        ) : (
          !notification.isRead && (
            <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2"></div>
          )
        )}
      </div>
    </div>
  );
}

export default function Notifications() {
  const { authUser } = useAuthStore();
  const { addNotification } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taggedPosts, setTaggedPosts] = useState([]);
  const [loadingTagged, setLoadingTagged] = useState(false);

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.getNotifications();

      const processed = res.data.notifications.map((n) => ({
        id: n.notification_id,
        type: n.type,
        user: {
          id: n.sender_id,
          username: n.sender_username,
          displayName:
            n.sender_display_name || n.sender_username || "User",
          profilePic: n.sender_profile_pic_url,
        },
        content: n.content,
        postPreview: n.post_media_url,
        timestamp: n.timestamp,
        isRead: n.is_read,
        postId: n.post_id,
        storyId: n.story_id,
        isFollowing: n.is_following_back || false, // 👈 Added
      }));

      setAllNotifications(processed);
    } catch (err) {
      console.error(err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to load notifications.",
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (activeTab !== "tagged" || !authUser) return;

    setLoadingTagged(true);
    API.getTaggedPosts({ userId: authUser.user_id })
      .then((res) => {
        if (res?.isSuccess) setTaggedPosts(res.data.posts);
      })
      .finally(() => setLoadingTagged(false));
  }, [activeTab, authUser]);

  const markAllAsRead = async () => {
    try {
      await API.markNotificationsRead();
      setAllNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch {
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to mark as read.",
      });
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return allNotifications;

    return allNotifications.filter((n) => {
      if (activeTab === "likes") return n.type === "like";
      if (activeTab === "comments")
        return n.type === "comment" || n.type === "mention";
      if (activeTab === "follows") return n.type === "follow";
      return false;
    });
  };

  const filtered = getFilteredNotifications();
  const grouped = groupNotificationsByDate(filtered);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-card-foreground">
            Notifications
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={fetchNotifications}
              className="p-2 rounded-full hover:bg-muted"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-primary font-medium disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>
        </div>

        <div className="flex space-x-1 bg-muted p-1 rounded-xl">
          {[
            { id: "all", label: "All" },
            { id: "likes", label: "Likes" },
            { id: "comments", label: "Comments" },
            { id: "follows", label: "Follows" },
            { id: "tagged", label: "Tagged" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold ${
                activeTab === t.id
                  ? "bg-card text-primary shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {activeTab === "tagged" ? (
          loadingTagged ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : taggedPosts.length > 0 ? (
            <div className="space-y-2">
              {taggedPosts.map((post) => (
                <TaggedNotificationItem
                  key={post.post_id}
                  post={post}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold">No Tagged Posts</h3>
              <p className="text-muted-foreground">
                You haven't been tagged in any posts.
              </p>
            </div>
          )
        ) : loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold mb-3 px-2">{date}</h2>

                <div className="bg-card border rounded-xl overflow-hidden">
                  {items.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      navigate={navigate}
                      setNotifications={setAllNotifications}
                      addNotification={addNotification}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
