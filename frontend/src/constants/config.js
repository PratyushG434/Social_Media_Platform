// config.js
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
  logout: { url: "/logout", method: "POST" },

  // POSTS & FEEDS
  createPost: { url: "/posts", method: "POST" },
  getHomeFeed: { url: "/posts/feed", method: "GET" }, // Following Feed
  getDiscoveryFeed: { url: "/posts", method: "GET" }, // Discovery/Explore Feed
  getLikedPosts: { url: "/posts/liked", method: "GET" },
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

  // USERS & PROFILE
  searchUsers: (query) => ({
    url: "/users/search",
    method: "GET",
    params: { q: query },
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

  // CHAT/MESSAGES (Placeholders)
  sendMessage: ({ id, text, image }) => ({
    url: `/send/${id}`,
    method: "POST",
    data: { text, image },
  }),
  getUsersForSidebar: { url: "/chatlist", method: "GET" },

  // NOTIFICATIONS (NEW)
  getNotifications: { url: "/notifications", method: "GET" },
  markNotificationsRead: { url: "/notifications/read", method: "PATCH" },
};
