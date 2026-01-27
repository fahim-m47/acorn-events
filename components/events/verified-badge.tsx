"use client"

import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
}

export function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-blue-600 p-0.5",
        className
      )}
      title="Verified host"
    >
      <CheckCircle className="h-3 w-3 text-white" />
    </span>
  )
}
