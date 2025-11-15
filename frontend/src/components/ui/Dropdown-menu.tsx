"use client"

import React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const context = useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

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

export function DropdownMenuContent({
  align = "center",
  className = "",
  children,
}: {
  align?: "start" | "center" | "end"
  className?: string
  children: React.ReactNode
}) {
  const context = useContext(DropdownMenuContext)
  const ref = useRef<HTMLDivElement>(null)

  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")

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
      className={`absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  className = "",
  onClick,
  children,
}: {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const context = useContext(DropdownMenuContext)
  if (!context) throw new Error("DropdownMenuItem must be used within DropdownMenu")

  const handleClick = () => {
    onClick?.()
    context.setOpen(false)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return <div className={`-mx-1 my-1 h-px bg-muted ${className}`} />
}
