"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EventImageProps {
  imageUrl?: string | null
  alt: string
  className?: string
  priority?: boolean
  variant?: "video" | "square" | "poster"
}

const DEFAULT_ASPECT_RATIO: Record<NonNullable<EventImageProps["variant"]>, number> = {
  video: 16 / 9,
  square: 1,
  poster: 8.5 / 11, // US Letter
}

const MIN_DYNAMIC_ASPECT_RATIO = 0.5
const MAX_DYNAMIC_ASPECT_RATIO = 1.9

const clampAspectRatio = (ratio: number) =>
  Math.min(Math.max(ratio, MIN_DYNAMIC_ASPECT_RATIO), MAX_DYNAMIC_ASPECT_RATIO)

export function EventImage({
  imageUrl,
  alt,
  className,
  priority = false,
  variant = "video",
}: EventImageProps) {
  const [dynamicAspectRatio, setDynamicAspectRatio] = useState<number | null>(null)
  const src = imageUrl || "/images/default-event.jpg"
  const isPoster = variant === "poster"
  const aspectRatio = dynamicAspectRatio ?? DEFAULT_ASPECT_RATIO[variant]

  useEffect(() => {
    setDynamicAspectRatio(null)
  }, [imageUrl, variant])

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        isPoster && "bg-zinc-950",
        className
      )}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(isPoster ? "object-contain" : "object-cover")}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoadingComplete={(img) => {
          if (!isPoster || !img.naturalWidth || !img.naturalHeight) return

          setDynamicAspectRatio(clampAspectRatio(img.naturalWidth / img.naturalHeight))
        }}
      />
    </div>
  )
}
