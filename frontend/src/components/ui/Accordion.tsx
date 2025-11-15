"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AccordionContextType {
  openItems: string[]
  toggleItem: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

interface AccordionProps {
  type?: "single" | "multiple"
  className?: string
  children: React.ReactNode
}

export function Accordion({ type = "single", className = "", children }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (value: string) => {
    if (type === "single") {
      setOpenItems(openItems.includes(value) ? [] : [value])
    } else {
      setOpenItems((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
    }
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  className = "",
  children,
}: { value: string; className?: string; children: React.ReactNode }) {
  return <div className={`border-b ${className}`}>{children}</div>
}

export function AccordionTrigger({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const context = useContext(AccordionContext)
  if (!context) throw new Error("AccordionTrigger must be used within Accordion")

  return (
    <button
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${className}`}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function AccordionContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`overflow-hidden text-sm transition-all ${className}`}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}
