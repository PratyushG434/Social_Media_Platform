"use client"

import { useState } from "react"
import Login from "../components/login"
import Dashboard from "../components/dashboard"

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState("login")

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
    // Simple mock authentication
    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "password") {
      setCurrentUser(user)
      setCurrentPage("dashboard")
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage("login")
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  if (currentPage === "login") {
    return <Login onLogin={handleLogin} onNavigate={navigateTo} />
  }

  return (
    <Dashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={navigateTo} currentPage={currentPage} />
  )
}
