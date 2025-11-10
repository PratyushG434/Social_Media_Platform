"use client"

import { useState } from "react"
import { useAuthStore } from "../store/useAuthStore";
import API from "../service/api";
import { useNavigate } from "react-router-dom";
import { NotificationProvider , useNotifications } from "./Notification-system";

 const LoginContent = ()=>{
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate();
  const { login, isLoggingIn , authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
   const { addNotification } = useNotifications();
  const handleSubmit = async(e) => {
    e.preventDefault()
    
    try {
    
      const response = await API.loginUser({
      email: email,
      password : password,
    });
      const mongoUser = response.data.user;
     console.log(mongoUser , ' user from loginpage')
    //  send data to authstore
     await login(mongoUser);  

     addNotification({
      type: "success",
      title: "Welcome to MediCall!",
      message: "Successfully signed in. Redirecting to dashboard...",
    });
  
      setIsLoading(false);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  } catch ( error ) {
    
    addNotification({
      type: "error",
      title: "Authentication Failed",
      message: err.message,
    });
  
   } 
    

  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">SocialApp</h1>
            <p className="text-muted-foreground">Connect with friends and share moments</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                Email or Username
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="text-destructive text-sm text-center">{error}</div>}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Login
            </button>

            {/* <button
              type="button"
              className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Login with Google
            </button> */}
          </form>

          <div className="mt-6 text-center space-y-2">
            <button className="text-primary hover:underline text-sm">Forgot Password?</button>
            <div className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <button onClick={() =>navigate("register")} className="text-primary hover:underline">
                Sign Up
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
export default function Login() {
  return (
    <NotificationProvider>
      <LoginContent />
    </NotificationProvider>
  );
}
