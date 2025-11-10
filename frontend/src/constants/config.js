// config.js

import { getuid } from "process";
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
  registerUser: {url: '/auth/register' , method: 'POST'} ,
  updateProfile : {url : '/updateProfile' , method : 'PUT'},
  checkAuth: {url : '/check' , method : 'GET'},
  logout: {url : '/logout' , method : 'POST'} ,
  getUsersForSidebar : {url : '/chatlist' , method : 'GET'},
  createPost : { url : '/posts' , method : 'POST'},
  getPosts : { url : '/posts' , method : 'GET'},
  getUserProfile : { url :'/users/me' , method : 'GET'},
  getAllPosts :{ url : '/posts' , method : 'GET'},
  
 sendMessage: ({ id, text , image }) => ({
  url: `/send/${id}`,
  method: "POST",
  data: { text , image},
}),
  getMessages : (meetingid) => ({ url : `/create/${meetingid}` , method : 'GET'}),

  

   // CRUD
  createMeeting: ({meetingId ,title , type}) => ({
     url: `/createmeeting/${meetingId}`,
      method: 'POST' ,
     data:{title , type},
    }),

  getMeetingById: (id) => ({ url: `/getmeetings/${id}`, method: 'GET' }),

  // Add participant
  addParticipant: (id) => ({ url: `/meeting/add-participant/${id}`, method: 'PUT' }),
    addleaveTime: (id) => ({ url: `/meeting/add-leaveTime/${id}`, method: 'PUT' }),

  // Add chat message
  addMessage: ({meetingId , message}) => ({ url: `/meeting/add-message/${meetingId}`, method: 'PUT' ,
  data : {message}}),

  // Add emotion
  addEmotion: ({meetingId , emoji}) => ({ url: `/meeting/add-emotion/${meetingId}`, method: 'PUT' ,  data : {emoji} }),
  
  getMeetingsForUser: {url : "/usermeetings" , method : 'GET'} ,
}; 
