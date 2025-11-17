export const API_NOTIFICATION_MESSAGES = {
  loading: {
    title: "Loading...",
    message: "Data is being loaded, please wait...",
  },
  success: {
    title: "Success",
    message: "Data successfully loaded.",
  },
  responseFailure: {
    title: "Error",
    message:
      "An error occurred while fetching response from the server. Please try again.",
  },
  requestFailure: {
    title: "Error",
    message: "An error occurred while parsing request data.",
  },
  networkError: {
    title: "Network Error",
    message:
      "Unable to connect to the server. Please check internet connectivity.",
  },
};

// API endpoint services
export const SERVICE_URLS = {
  contactUs: { url: "/contactUs", method: "POST" },
  loginUser: { url: "/auth/login", method: "POST" },
  registerUser: { url: "/auth/register", method: "POST" },

  checkAuth: { url: "/users/check", method: "GET" },
  logout: { url: "/auth/logout", method: "POST" },

  // POSTS & FEEDS
  createPost: { url: "/posts", method: "POST" },
  getHomeFeed: { url: "/posts/feed", method: "GET" }, // Following Feed
  getDiscoveryFeed: { url: "/posts", method: "GET" }, // Discovery/Explore Feed

  getTaggedPosts: ({ userId }) => ({
    url: `/posts/tagged/${userId}`,
    method: "GET",
  }),

  getLikedPosts: { url: "/posts/liked", method: "GET" },
  getVideos: {
    url: "/posts/videos",
    method: "GET",
  },
  getPostById: (postId) => ({
    url: `/posts/${postId}`,
    method: "GET",
  }),

  toggleLike: (postId) => ({
    url: `/posts/${postId}/likes`,
    method: "POST",
  }),
  addComment: ({ postId, content }) => ({
    url: `posts/${postId}/comments`,
    method: "POST",
    data: { content },
  }),
  getComments: ({ postId }) => ({
    url: `posts/${postId}/comments`,
    method: "GET",
  }),
   getPostLikers: ({ postId }) => ({
    url: `posts/${postId}/likers`,
    method: "GET",
  }),
  
  

  deletePost: (postId) => ({
    url: `/posts/${postId}`,
    method: "DELETE",
  }),

  // USERS & PROFILE
  searchUsers: ({ searchQuery }) => ({
    url: "/users/search",
    method: "GET",
    params: { q: searchQuery },
  }),
  getSuggestedUsers: { url: "/users/suggestions", method: "GET" },
  getMyProfile: { url: "/users/me", method: "GET" },
  getUserProfile: ({ userId }) => ({
    url: `/users/${userId}`,
    method: "GET",
  }),
  toggleFollow: ({ userId }) => ({
    url: `/users/${userId}/follow`,
    method: "POST",
  }),
  updateMyProfile: ({ userID, formData }) => ({
    url: `/users/${userID}`,
    method: "PATCH",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }),

  // STORIES
  createStory: { url: "/stories", method: "POST" },
  getStoriesFeed: { url: "/stories/feed", method: "GET" },
  getUserStories: (userId) => ({
    url: `/stories/user/${userId}`,
    method: "GET",
  }),
  toggleStoryLike: ({ storyId }) => ({
    url: `stories/${storyId}/likes`,
    method: "POST",
  }),
  reactToStory: ({ storyId, reaction }) => ({
    url: `stories/${storyId}/reactions`,
    method: "POST",
    data: { reaction },
  }),

  getStoryLikes: ({ storyId }) => ({
    url: `stories/${storyId}/getLikes`,
    method: "GET",
  }),
  getStoryReactions: ({ storyId }) => ({
    url: `stories/${storyId}/reactions`,
    method: "GET",
  }),
  deleteStory: (storyId) => ({
    url: `/stories/${storyId}`,
    method: "DELETE",
  }),

  // CHAT/MESSAGES

  createChat: ({ targetUserId }) => ({
    url: "/chats",
    method: "POST",
    data: { targetUserId },
  }),
  getUserChats: { url: "/chats", method: "GET" },

  // Using query parameters for chat details
  getChatDetails: (chatId) => ({
    url: `/chats/detail`,
    method: "GET",
    params: { chatId: chatId },
  }),

  getChatMessages: (chatId) => ({
    url: `/chats/${chatId}/messages`,
    method: "GET",
  }),

  deleteChatMessage: (messageId) => ({
    url: `/chats/messages/${messageId}`,
    method: "DELETE",
  }),

  // NOTIFICATIONS (NEW)
  getNotifications: { url: "/notifications", method: "GET" },
  markNotificationsRead: { url: "/notifications/read", method: "PATCH" },
};
