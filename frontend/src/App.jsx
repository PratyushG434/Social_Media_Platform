"use client"

import { useState  , useEffect} from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"
import {useAuthStore} from './store/useAuthStore'

import { Loader } from 'lucide-react'
function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  
   console.log({ onlineUsers  } , " online user from app.jsx");
  console.log( authUser);
  
    useEffect(() => {
    checkAuth();
  }, [checkAuth]);

    // if (isCheckingAuth && !authUser)
    // return (
    //   <div className="flex items-center justify-center h-screen">
    //     <Loader className="size-10 animate-spin" />
    //   </div>
    // );
 
 

  return (
    <>
   
    <Router>
      <Routes>
        <Route
          path="/login"
          element={authUser ? <Navigate to="/dashboard" /> : <Login  />}
        />
        <Route
          path="/register"
          element={authUser ? <Navigate to="/dashboard" /> : <Register  />}
        />
        <Route
          path="/dashboard/*"
          element={
            authUser ? (
              <Dashboard  />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
       
        <Route path="/" element={<Navigate to={authUser ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
    
    </>
  )
}

export default App
