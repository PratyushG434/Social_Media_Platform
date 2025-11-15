"use client"
import { useState } from "react"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({ checked = false, onCheckedChange, disabled = false, className = "" }: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(checked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleToggle = () => {
    if (disabled) return
    const newChecked = !isChecked
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    } else {
      setInternalChecked(newChecked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        isChecked ? "bg-primary" : "bg-input"
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          isChecked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}
