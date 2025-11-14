// config.js



// import { getUserProfile } from "../../../backend/controllers/userController";
// import { getAllPosts } from "../../../backend/services/postService";


// Notification Messages
export const API_NOTIFICATION_MESSAGES = {
  loading: {
    title: 'Loading...',
    message: 'Data is being loaded, please wait...',
  },
  success: {
    title: 'Success',
    message: 'Data successfully loaded.',
  },
  responseFailure: {
    title: 'Error',
    message: 'An error occurred while fetching response from the server. Please try again.',
  },
  requestFailure: {
    title: 'Error',
    message: 'An error occurred while parsing request data.',
  },
  networkError: {
    title: 'Network Error',
    message: 'Unable to connect to the server. Please check internet connectivity.',
  },
};

// API endpoint services
export const SERVICE_URLS = {

  contactUs: { url: '/contactUs', method: 'POST' },
  loginUser: { url: '/auth/login', method: 'POST' },
  registerUser: { url: '/auth/register', method: 'POST' },

  checkAuth: { url: '/users/check', method: 'GET' },
  logout: { url: '/logout', method: 'POST' },
  getUsersForSidebar: { url: '/chatlist', method: 'GET' },
  createPost: { url: '/posts', method: 'POST' },
  createStory: { url: '/stories', method: 'POST' },
  getPosts: { url: '/posts', method: 'GET' },
  getMyProfile: { url: '/users/me', method: 'GET' },
  getUserProfile: ({ userId }) => ({
    url: `users/${userId}`,
    method: 'GET',
  }),

  toggleFollow: ({ userId }) => ({
    url: `/users/${userId}/follow`,
    method: "POST"
  }),

  getSuggestedUsers: { url: '/users/suggestions', method: 'GET' }, // NEW

  searchUsers: (query) => ({
    url: '/users/search',
    method: 'GET',
    params: { q: query }
  }),


  getLikedPosts: { url: '/posts/liked', method: 'GET' }, // NEW
  getAllPosts: { url: '/posts', method: 'GET' },
  getStoriesFeed: { url: '/stories/feed', method: 'GET' },

  getUserStories: (userId) => ({
    url: `/stories/user/${userId}`,
    method: 'GET'
  }),
  toggleLike: (postId) => ({
    url: `/posts/${postId}/likes`,
    method: 'POST'
  }),

  addComment: ({ postId, content }) =>
  ({
    url: `posts/${postId}/comments`,
    method: 'POST',
    data: { content },
  }),

  sendMessage: ({ id, text, image }) => ({
    url: `/send/${id}`,
    method: "POST",
    data: { text, image },
  }),
  getComments: ({ postId }) =>
  ({
    url: `posts/${postId}/comments`,
    method: 'GET',

  }),

  toggleStoryLike: ({ storyId }) => ({
    url: `stories/${storyId}/likes`,
    method: 'POST',
  }),

  reactToStory: ({ storyId, reaction }) => ({
    url: `stories/${storyId}/reactions`,
    method: 'POST',
    data: { reaction },
  }),

  updateMyProfile: ({userID, formData}) => ({
    url: `/users/${userID}`,
    method: "PATCH",
    body: formData, // keep raw
    headers: { "Content-Type": "multipart/form-data" },
  }),
  // getMessages: (meetingid) => ({ url: `/create/${meetingid}`, method: 'GET' }),





  //   // CRUD
  //   createMeeting: ({ meetingId, title, type }) => ({
  //     url: `/createmeeting/${meetingId}`,
  //     method: 'POST',
  //     data: { title, type },
  //   }),

  //   getMeetingById: (id) => ({ url: `/getmeetings/${id}`, method: 'GET' }),

  //   // Add participant
  //   addParticipant: (id) => ({ url: `/meeting/add-participant/${id}`, method: 'PUT' }),
  //   addleaveTime: (id) => ({ url: `/meeting/add-leaveTime/${id}`, method: 'PUT' }),

  //   // Add chat message
  //   addMessage: ({ meetingId, message }) => ({
  //     url: `/meeting/add-message/${meetingId}`, method: 'PUT',
  //     data: { message }
  //   }),

  //   // Add emotion
  //   addEmotion: ({ meetingId, emoji }) => ({ url: `/meeting/add-emotion/${meetingId}`, method: 'PUT', data: { emoji } }),

  //   getMeetingsForUser: { url: "/usermeetings", method: 'GET' },
}; 
