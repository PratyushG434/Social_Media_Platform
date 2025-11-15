"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface CommandContextType {
  search: string
  setSearch: (search: string) => void
}

const CommandContext = createContext<CommandContextType | undefined>(undefined)

export function Command({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const [search, setSearch] = useState("")

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground ${className}`}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
}

export function CommandInput({ placeholder, className = "" }: { placeholder?: string; className?: string }) {
  const context = useContext(CommandContext)
  if (!context) throw new Error("CommandInput must be used within Command")

  return (
    <div className="flex items-center border-b px-3">
      <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        value={context.search}
        onChange={(e) => context.setSearch(e.target.value)}
        placeholder={placeholder}
        className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
    </div>
  )
}

export function CommandList({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className}`}>{children}</div>
}

export function CommandEmpty({ children }: { children: React.ReactNode }) {
  const context = useContext(CommandContext)
  if (!context) throw new Error("CommandEmpty must be used within Command")

  return <div className="py-6 text-center text-sm">{children}</div>
}

export function CommandGroup({
  heading,
  className = "",
  children,
}: { heading?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden p-1 text-foreground ${className}`}>
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}
      {children}
    </div>
  )
}

export function CommandItem({
  className = "",
  onSelect,
  children,
}: {
  className?: string
  onSelect?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      {children}
    </div>
  )
}
