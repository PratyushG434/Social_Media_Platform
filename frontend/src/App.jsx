"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import { useAuthStore } from './store/useAuthStore'
import Profile from "./components/Profile"
import { Loader } from 'lucide-react'
import PostDetail from "./components/postDetail"

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // FIX: Show loader while checking auth status to prevent premature redirect
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={authUser ? <Navigate to="/dashboard" /> : <Register />}
        />
        
        <Route
          path="/dashboard/*"
          element={authUser ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route 
          path="/post/:postId" 
          element={authUser ? <PostDetail /> : <Navigate to="/login" />} 
        />

        
        {/* Profile routes require user to be logged in */}
        <Route 
          path="/profile/:userId" 
          element={authUser ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={authUser ? <Profile /> : <Navigate to="/login" />} 
        />
        
        {/* Default route */}
        <Route 
          path="/" 
          element={<Navigate to={authUser ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  )
}

export default App