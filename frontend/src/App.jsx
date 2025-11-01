"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/Dashboard"

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  // Mock user data
  const mockUsers = [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      displayName: "John Doe",
      bio: "Love photography and travel ✈️",
      profilePic: "/man-profile.png",
      followers: 1234,
      following: 567,
      posts: [],
    },
  ]

  const handleLogin = (email, password) => {
    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "password") {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const handleRegister = (userData) => {
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      profilePic: "/man-profile.png",
      followers: 0,
      following: 0,
      posts: [],
    }
    mockUsers.push(newUser)
    setCurrentUser(newUser)
    return true
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Register onRegister={handleRegister} />}
        />
        <Route
          path="/dashboard/*"
          element={
            currentUser ? (
              <Dashboard currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
