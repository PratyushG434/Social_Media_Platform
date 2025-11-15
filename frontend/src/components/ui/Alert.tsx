import type React from "react"

interface AlertProps {
  variant?: "default" | "destructive"
  className?: string
  children: React.ReactNode
}

export function Alert({ variant = "default", className = "", children }: AlertProps) {
  const variants = {
    default: "bg-background text-foreground",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
  }

  return <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}>{children}</div>
}

export function AlertDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
}

export function AlertTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>{children}</h5>
}
