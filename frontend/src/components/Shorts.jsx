"use client"

import { useState } from "react"

export default function Shorts({ currentUser, onNavigate }) {
  const [currentShort, setCurrentShort] = useState(0)

  const shorts = [
    {
      id: 1,
      creator: "TechReviewer",
      title: "iPhone 15 First Look",
      likes: "45K",
      comments: "2.1K",
      shares: "890",
      thumbnail: "/man-profile.png",
    },
    {
      id: 2,
      creator: "FoodieLife",
      title: "60-Second Pasta Recipe",
      likes: "78K",
      comments: "3.5K",
      shares: "1.2K",
      thumbnail: "/woman-chef-preparing-food.png",
    },
    {
      id: 3,
      creator: "TravelVlog",
      title: "Hidden Beach Paradise",
      likes: "92K",
      comments: "4.8K",
      shares: "2.1K",
      thumbnail: "/sunset-beach-tranquil.png",
    },
  ]

  const nextShort = () => {
    setCurrentShort((prev) => (prev + 1) % shorts.length)
  }

  const prevShort = () => {
    setCurrentShort((prev) => (prev - 1 + shorts.length) % shorts.length)
  }

  return (
    <div className="shorts-container relative">
      {shorts.map((short, index) => (
        <div
          key={short.id}
          className={`shorts-item relative bg-black flex items-center justify-center ${
            index === currentShort ? "block" : "hidden"
          }`}
        >
          <div className="relative w-full h-full max-w-md mx-auto">
            <img
              src={short.thumbnail || "/placeholder.svg"}
              alt={short.title}
              className="w-full h-full object-cover rounded-lg"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{short.creator.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{short.creator}</p>
                    <p className="text-sm opacity-80">{short.title}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-4 bottom-20 flex flex-col gap-4">
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <span className="text-xl">❤️</span>
              </button>
              <span className="text-white text-sm text-center">{short.likes}</span>

              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <span className="text-xl">💬</span>
              </button>
              <span className="text-white text-sm text-center">{short.comments}</span>

              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <span className="text-xl">📤</span>
              </button>
              <span className="text-white text-sm text-center">{short.shares}</span>
            </div>

            <button
              onClick={prevShort}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">↑</span>
            </button>

            <button
              onClick={nextShort}
              className="absolute left-4 top-1/2 translate-y-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <span className="text-xl">↓</span>
            </button>
          </div>
        </div>
      ))}

      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {shorts.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-1 rounded-full transition-colors ${index === currentShort ? "bg-accent" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  )
}
