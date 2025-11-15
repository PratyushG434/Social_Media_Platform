"use client"

import React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"

interface PopoverContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined)

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const context = useContext(PopoverContext)
  if (!context) throw new Error("PopoverTrigger must be used within Popover")

  const handleClick = () => {
    context.setOpen(!context.open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as any)
  }

  return <button onClick={handleClick}>{children}</button>
}

export function PopoverContent({
  align = "center",
  className = "",
  children,
}: {
  align?: "start" | "center" | "end"
  className?: string
  children: React.ReactNode
}) {
  const context = useContext(PopoverContext)
  const ref = useRef<HTMLDivElement>(null)

  if (!context) throw new Error("PopoverContent must be used within Popover")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [context.open, context])

  if (!context.open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-1 z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </div>
  )
}
