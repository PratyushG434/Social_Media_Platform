import axios from 'axios';

import {API_NOTIFICATION_MESSAGES , SERVICE_URLS}  from "../constants/config.js"

const API_URL = 'http://localhost:8000/api';
//ek comman api bana rahe hai
// ✅ Create axios instance and store it in a variable
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 20000,
    withCredentials: true, 
    headers: {
        "Accept": "application/json, multipart/form-data", 
    }
 });

// Function to handle file upload
export const uploadFile = (formData) => {
    return axiosInstance.post('/file/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'  // This ensures the file is sent correctly
        }
    });
};

// ✅ Add interceptors to the axios instance
//req ka interceptors
//phela callback success ke case mai and dousra error ke case mai
axiosInstance.interceptors.request.use(
   function (config){
    return config ;
   },
   function(error){
    return Promise.reject(error);
   }
)
axiosInstance.interceptors.response.use(
    function(response){
        //stop global loader here
        return  processResponse(response) ;
    },
    function(error){
        //stop global loader here
        return Promise.reject(processError(error));
    }
)

// ✅ Process API responses
//if success -> return (issuccess = true , data:object)
//if fail -> return (isfailure:true , status: string ,msg:string , code >400)
const processResponse = (response) =>{
    if(response?.status ===200 || response?.status === 201){
        return {isSuccess : true , data : response.data}
    }
    else{
        return{
            isFailure : true ,
            status : response?.status ,
            msg : response?.msg ,
            code : response?.code,
        }
    }
}

// ✅ Handle API errors
const processError = async (error) =>{
    //error teen tarah ki hoti hai 
    if(error.response ){
        //jinmme res ata hai
     //req made and server responded with a status other 
     //that fail out of the range 2.x.x   
        console.log('error in response ' , error.toJSON());
        return{
            isError :' true',
            msg : API_NOTIFICATION_MESSAGES.reponseFailure ,
            code : error.response.status
        }
    }
    else if (error.request){
           //jinme req ati hai
        //request made but no res was recived 
        console.log('Error in respnse:', error.request);
        console.log('error in req ' , error.toJSON());
        return{
            isError :' true',
            msg : API_NOTIFICATION_MESSAGES.requestFailure ,
            code : ""
        }  
    }
    else{
        //jinme kuch nahi ata
        //something happend in setting up req that triggers and error
        console.log('error in network ' , error.toJSON());
        return{
            isError :' true',
            msg : API_NOTIFICATION_MESSAGES.netWorkError ,
            code : ""//yaha pe backend ke pass req gai he nahi
        }
    }
}

// ✅ Create API object dynamically
const API = {};
for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress, config = {}) => {
      const serviceConfig = typeof value === 'function' ? value(body) : value; // Call if it's a function
  
      const axiosConfig = {
        method: serviceConfig.method,
        url: serviceConfig.url,
        headers: {
          
        },
        responseType: serviceConfig.responseType,
        onUploadProgress: function (progressEvent) {
          showUploadProgress?.(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
        onDownloadProgress: function (progressEvent) {
          showDownloadProgress?.(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
        ...config,
      };
  
      if (axiosConfig.method.toLowerCase() === 'get') {
        axiosConfig.params = config.params || {};
      } else {
        axiosConfig.data = body;
      }
  
      return axiosInstance(axiosConfig);
    };
  }
  export default API ;
