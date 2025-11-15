import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../service/api';
import PostCard from './PostCard'; // Reuse PostCard component
import { useNotifications } from './Notification-system';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the single post
  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.getPostById(postId);
      if (!response?.isSuccess) {
        throw new Error(response?.msg || "Post not found.");
      }
      setPost(response.data.post);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(err.message);
      addNotification({
        type: 'error',
        title: 'Error',
        message: err.message || "Failed to load post.",
      });
    } finally {
      setLoading(false);
    }
  }, [postId, addNotification]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Handler for like toggle, re-fetches or updates local state
  const handleLikeToggle = (pId, currentlyLiked) => {
    // Optimistic update for the current post
    setPost(prevPost => ({
        ...prevPost,
        user_has_liked: !currentlyLiked,
        likes_count: currentlyLiked ? prevPost.likes_count - 1 : prevPost.likes_count + 1,
    }));

    API.toggleLike(pId).catch(err => {
      console.error("Failed to sync like with server:", err);
      // Revert optimistic update on failure
      setPost(prevPost => ({
        ...prevPost,
        user_has_liked: currentlyLiked,
        likes_count: currentlyLiked ? prevPost.likes_count + 1 : prevPost.likes_count - 1,
      }));
      addNotification({ type: 'error', title: 'Like Failed', message: 'Could not update like status on server.' });
    });
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        Loading post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold text-destructive">Error Loading Post</h2>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center space-x-3 mb-4">
        <button 
            onClick={() => navigate(-1)} 
            className="text-muted-foreground hover:text-card-foreground transition-colors p-2 rounded-full hover:bg-muted"
        >
            <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-bold text-card-foreground">Post Detail</h1>
      </div>
      
      {/* Reusing the PostCard component for display */}
      <PostCard post={{ ...post, user_has_liked: post.user_has_liked }} onLikeToggle={handleLikeToggle} />
      
    </div>
  );
}