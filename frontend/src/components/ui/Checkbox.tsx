"use client"
import { useState } from "react"

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Checkbox({ checked = false, onChange, disabled = false, className = "" }: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(checked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleChange = () => {
    if (disabled) return
    const newChecked = !isChecked
    if (onChange) {
      onChange(newChecked)
    } else {
      setInternalChecked(newChecked)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      onClick={handleChange}
      disabled={disabled}
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        isChecked ? "bg-primary text-primary-foreground" : "bg-background"
      } ${className}`}
    >
      {isChecked && (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  )
}
