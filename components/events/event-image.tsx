"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface EventImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  priority?: boolean
}

export function EventImage({ imageUrl, alt, className, priority = false }: EventImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg",
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-zinc-900" />
      )}
    </div>
  )
}
