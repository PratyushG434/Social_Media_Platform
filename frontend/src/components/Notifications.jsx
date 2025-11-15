"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import API from "../service/api"
import { useNotifications as useToast } from "./Notification-system"
import Avatar from "./Avatar"
import { formatDistanceToNow, isToday, isThisWeek, parseISO } from 'date-fns'
import { RefreshCw } from "lucide-react"

// --- Helper Functions ---

// Groups notifications by date categories
const groupNotificationsByDate = (notifications) => {
    const groups = {
        Today: [],
        "This Week": [],
        Earlier: [],
    };

    notifications.forEach(notification => {
        // Ensure the timestamp is a valid ISO string before parsing
        if (!notification.timestamp || typeof notification.timestamp !== 'string') {
            groups.Earlier.push(notification);
            return;
        }

        try {
            const date = parseISO(notification.timestamp);
            if (isToday(date)) {
                groups.Today.push(notification);
            } else if (isThisWeek(date, { weekStartsOn: 1 })) {
                groups["This Week"].push(notification);
            } else {
                groups.Earlier.push(notification);
            }
        } catch (e) {
            groups.Earlier.push(notification); 
        }
    });

    if (groups.Today && groups.Today.length === 0) delete groups.Today;
    if (groups["This Week"] && groups["This Week"].length === 0) delete groups["This Week"];
    if (groups.Earlier && groups.Earlier.length === 0) delete groups.Earlier;

    return groups;
};


// Skeleton Loader for a single notification item
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


// --- Notification Item Sub-Component ---
function NotificationItem({ notification, navigate, setNotifications, addNotification }) {

    const handleItemClick = () => {
        // Mark as read locally (optimistic update)
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        
        // Navigate
        if (notification.type === 'follow' && notification.user.id) {
            navigate(`/profile/${notification.user.id}`);
        } else if (notification.postId) {
            navigate(`/post/${notification.postId}`);
        }
    };

    const handleFollowBack = async (e) => {
        e.stopPropagation();
        try {
            const response = await API.toggleFollow({ userId: notification.user.id });
            const { following } = response.data;

            if(following){
                addNotification({ type: 'success', title: 'Followed Back!', message: `You are now following ${notification.user.displayName}.` });
            }
            // You might want to update the local list state to remove the "Follow" button
            // This is complex, so for simplicity, we just rely on the toast notification here.

        } catch (err) {
            addNotification({ type: 'error', title: 'Follow Failed', message: 'Could not follow back the user.' });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "like": return "❤️";
            case "comment": return "💬";
            case "follow": return "👤";
            default: return "🔔";
        }
    };
    
    // Ensure timestamp is valid before calculating distance
    const timeDisplay = notification.timestamp 
        ? formatDistanceToNow(parseISO(notification.timestamp), { addSuffix: true })
        : "N/A";
    
    return (
        <div
            onClick={handleItemClick}
            className={`flex items-start space-x-4 p-4 transition-colors cursor-pointer ${
                !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted"
            }`}
        >
            {/* Avatar with Icon */}
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

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-card-foreground">
                    <span className="font-semibold">{notification.user.displayName}</span>
                    <span className="text-muted-foreground"> {notification.content}</span>
                </p>
                <p className="text-sm text-primary font-medium mt-1">
                    {timeDisplay}
                </p>
            </div>

            {/* Action/Preview */}
            <div className="flex-shrink-0 self-center">
                {notification.postPreview ? (
                    <img src={notification.postPreview} alt="Post preview" className="w-14 h-14 rounded-md object-cover" />
                ) : notification.type === "follow" ? (
                    // We assume the notification only appears if the user is NOT already following back
                    <button
                        onClick={handleFollowBack}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
                    >
                        Follow Back
                    </button>
                ) : (
                    !notification.isRead && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2"></div>
                )}
            </div>
        </div>
    );
}

// --- Main Notifications Component ---

export default function Notifications() {
    const [activeTab, setActiveTab] = useState("all");
    const [allNotifications, setAllNotifications] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const { addNotification } = useToast();
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.getNotifications();
            if (!response?.isSuccess) throw new Error("Failed to load notifications.");
            
            const processed = response.data.notifications.map(n => ({
                id: n.notification_id,
                type: n.type,
                user: {
                    id: n.sender_id,
                    username: n.sender_username,
                    displayName: n.sender_display_name || n.sender_username || "Unknown User",
                    profilePic: n.sender_profile_pic_url,
                },
                content: n.content,
                postPreview: n.post_media_url,
                timestamp: n.timestamp,
                isRead: n.is_read,
                postId: n.post_id,
                storyId: n.story_id,
            }));
            setAllNotifications(processed); 
        } catch (err) {
            console.error('Error fetching notifications:', err);
            addNotification({ type: 'error', title: 'Loading Error', message: 'Failed to fetch notifications.' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);
    
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAllAsRead = async () => {
        try {
            await API.markNotificationsRead();
            setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            addNotification({ type: 'success', title: 'Success', message: 'All notifications marked as read.' });
        } catch (err) {
            addNotification({ type: 'error', title: 'Error', message: 'Failed to mark as read.' });
        }
    };

    // --- Filter Logic ---
    const getFilteredNotifications = () => {
        if (activeTab === "all") return allNotifications;
        return allNotifications.filter(n => {
            if (activeTab === "likes") return n.type === "like";
            if (activeTab === "comments") return n.type === "comment" || n.type === "mention";
            if (activeTab === "follows") return n.type === "follow";
            return false;
        });
    };
    
    const filteredNotifications = getFilteredNotifications();
    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    const unreadCount = allNotifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-3xl mx-auto pb-8">
            {/* Header */}
            <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border p-4 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-card-foreground">Notifications</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={fetchNotifications}
                            className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                            title="Refresh notifications"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex space-x-1 bg-muted p-1 rounded-xl">
                  {[
                    { id: "all", label: "All" },
                    { id: "likes", label: "Likes" },
                    { id: "comments", label: "Comments" },
                    { id: "follows", label: "Follows" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label} ({allNotifications.filter(n => tab.id === 'all' || n.type === tab.id || (tab.id === 'comments' && n.type === 'mention')).length})
                    </button>
                  ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {loading ? (
                    // Skeleton Loading UI
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <NotificationSkeleton key={i} />)}
                    </div>
                ) : Object.keys(groupedNotifications).length > 0 ? (
                    // Grouped Notification List
                    <div className="space-y-6">
                        {Object.entries(groupedNotifications).map(([groupTitle, groupItems]) => (
                            <div key={groupTitle}>
                                <h2 className="text-lg font-semibold text-card-foreground mb-3 px-2">{groupTitle}</h2>
                                <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
                                    {groupItems.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
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
                    // Empty State
                    <div className="text-center py-20">
                         <div className="text-7xl mb-4">🔕</div>
                        <h3 className="text-xl font-bold text-card-foreground mb-2">No Notifications Here</h3>
                        <p className="text-muted-foreground">
                            {activeTab === "all" ? "You're all caught up!" : `You have no new notifications for ${activeTab}.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}