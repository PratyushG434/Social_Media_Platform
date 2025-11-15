"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"

interface DialogContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

export function DialogContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within Dialog")

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => context.onOpenChange(false)} />

      {/* Content */}
      <div
        className={`relative z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${className}`}
      >
        <button
          onClick={() => context.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <svg className="h-4 w-4 glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>
}

export function DialogTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export function DialogDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}
