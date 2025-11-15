"use client"

import { useEffect, useState, useCallback } from "react"
import API from "../service/api"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate, useParams } from "react-router-dom"
import Avatar from "./Avatar"; 

export default function Profile() {
  const { userId: paramId } = useParams();
  const userId = paramId ? parseInt(paramId, 10) : null; 

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const isOwnProfile = !paramId || (authUser && authUser.user_id === userId);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followsMe, setFollowsMe] = useState(false);

  // --- Fetch User Profile Data ---
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setUser(null);
    setUserPosts([]);

    try {
      if (isOwnProfile && !authUser?.user_id) {
          if (!paramId) navigate('/login'); 
          return; 
      }

      const targetId = isOwnProfile ? authUser.user_id : userId;
      if (!targetId) {
        throw new Error("Target User ID is not valid.");
      }
      
      const response = isOwnProfile
        ? await API.getMyProfile()
        : await API.getUserProfile({ userId: targetId });
      
      if (!response?.isSuccess) {
          if (response?.code === 404) {
              throw new Error("User not found.");
          }
          throw new Error("Failed to fetch user data.");
      }

      const { user: userData} = response.data;
      const {  posts: userPostsData, followers: userFollowers, following: userFollowing } = response.data.user;
      setUser(userData);
      setUserPosts(userPostsData || []);

      if (!isOwnProfile && authUser && userData) {
          const currentAuthUserId = authUser.user_id;

          const isAuthUserFollowing = userFollowers?.some(f => f.user_id === currentAuthUserId) || false;
          setIsFollowing(isAuthUserFollowing);
          
          const doesTargetFollowMe = userFollowing?.some(f => f.user_id === currentAuthUserId) || false;
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

  useEffect(() => {
    if ( (isOwnProfile && authUser?.user_id) || (!isOwnProfile && userId) ) {
        fetchUserProfile();
    } else if (!authUser && !paramId) {
        setLoading(false);
        setUser(null);
        navigate('/login');
    } else {
        setLoading(false);
        setUser(null);
    }
  }, [userId, isOwnProfile, authUser, paramId, navigate, fetchUserProfile]);


  const handleFollowToggle = useCallback(async () => {
    if (!user || !authUser) return; 

    const targetUserId = user.user_id;

    setIsFollowing(prev => !prev);
    
    setUser(prevUser => {
        if (!prevUser) return null;
        const newFollowers = isFollowing 
            ? prevUser.followers.filter(f => f.user_id !== authUser.user_id) 
            : [...prevUser.followers, { user_id: authUser.user_id, username: authUser.username }];
        return { ...prevUser, followers: newFollowers };
    });

    try {
      const response = await API.toggleFollow({ userId: targetUserId });
      if (!response?.isSuccess) throw new Error("Failed to toggle follow status");

      const { following } = response.data; 
      setIsFollowing(following); 

    } catch (err) {
      console.error("Follow toggle error:", err);
      setIsFollowing(prev => !prev);
    }
  }, [user, authUser, isFollowing]);


  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-xl font-bold text-destructive">Profile Not Found</h2>
        <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
        <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
            Go to Feed
        </button>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="text-xl">←</span>
          </button>

          <h1 className="text-xl font-semibold text-card-foreground">@{user.username}</h1>

          {isOwnProfile ? (
            <button
                onClick={() => navigate("/dashboard/settings")}
                className="text-muted-foreground hover:text-card-foreground transition-colors"
            >
                <span className="text-xl">⚙️</span>
            </button>
          ) : <div className="w-6"></div>}

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
            <h2 className="text-xl font-bold text-card-foreground">{user.display_name}</h2>
            <p className="text-muted-foreground mb-3">{user.bio || "No bio yet."}</p>

            {/* Stats */}
            <div className="flex space-x-6 mb-4">
              <div className="text-center">
                <p className="font-bold text-card-foreground">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>

              <button className="text-center">
                <p className="font-bold text-card-foreground">{user.followers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>

              <button className="text-center">
                <p className="font-bold text-card-foreground">{user.following?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            {/* ⭐ BUTTON LOGIC */}
            <div className="flex space-x-2">
              {isOwnProfile ? (
                <>
                  {/* Edit Profile + Share */}
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
                  {/* ⭐ OTHER USER PROFILE BUTTON */}
                  <button
                    onClick={handleFollowToggle}
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {isFollowing
                      ? "Unfollow"
                      : followsMe
                        ? "Follow Back"
                        : "Follow"}
                  </button>

                  <button className="bg-muted text-card-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors">
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
              className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "posts"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-card-foreground"
                }`}
            >
              <span className="text-lg mr-2">📱</span> Posts
            </button>

            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "tagged"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-card-foreground"
                }`}
            >
              <span className="text-lg mr-2">🏷️</span> Tagged
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.length > 0 ? (
                userPosts.map((post) => (
                    <div key={post.post_id} className="relative aspect-square group cursor-pointer">
                        <img
                          src={post.media_url || "/placeholder.svg"}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                    </div>
                ))
            ) : (
              <p className="text-center text-muted-foreground py-8 col-span-full">No posts yet.</p>
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
    </div>
  )
}