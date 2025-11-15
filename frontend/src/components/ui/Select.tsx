"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = useState("")
  const [open, setOpen] = useState(false)

  const currentValue = value !== undefined ? value : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")

  return <span>{context.value || placeholder}</span>
}

export function SelectContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")

  if (!context.open) return null

  return (
    <div
      className={`absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  return (
    <div
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      {context.value === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
      {children}
    </div>
  )
}
