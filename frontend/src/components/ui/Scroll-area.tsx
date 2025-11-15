"use client"

import type React from "react"
import { forwardRef } from "react"

interface ScrollAreaProps {
  className?: string
  children: React.ReactNode
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({ className = "", children }, ref) => {
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className="h-full w-full rounded-[inherit] overflow-auto custom-scrollbar">{children}</div>
    </div>
  )
})

ScrollArea.displayName = "ScrollArea"
