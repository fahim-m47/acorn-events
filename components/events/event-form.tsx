"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Event } from "@/types"

interface EventFormProps {
  initialData?: Partial<Event>
  action: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel?: string
}

export function EventForm({ initialData, action, submitLabel = "Create Event" }: EventFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatDateTimeLocal = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toISOString().slice(0, 16)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setIsPending(true)

    const formData = new FormData(e.currentTarget)

    // Client-side validation
    const title = formData.get("title") as string
    const startTime = formData.get("start_time") as string

    const newErrors: Record<string, string> = {}

    if (!title?.trim()) {
      newErrors.title = "Title is required"
    }

    if (!startTime) {
      newErrors.start_time = "Start time is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsPending(false)
      return
    }

    try {
      const result = await action(formData)
      if (result?.error) {
        setErrors({ form: result.error })
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errors.form}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title || ""}
          placeholder="Event title"
          className="bg-zinc-900 border-zinc-800"
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          placeholder="Tell people about your event..."
          rows={5}
          className="bg-zinc-900 border-zinc-800 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={initialData?.location || ""}
          placeholder="Where is this event?"
          className="bg-zinc-900 border-zinc-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(initialData?.start_time)}
            className="bg-zinc-900 border-zinc-800"
          />
          {errors.start_time && (
            <p className="text-sm text-red-400">{errors.start_time}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            defaultValue={formatDateTimeLocal(initialData?.end_time)}
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="link">Event Link</Label>
        <Input
          id="link"
          name="link"
          type="url"
          defaultValue={initialData?.link || ""}
          placeholder="https://..."
          className="bg-zinc-900 border-zinc-800"
        />
      </div>

      <div className="space-y-2">
        <Label>Event Image</Label>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-zinc-800">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4 text-zinc-300" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-video w-full max-w-md rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <Upload className="h-8 w-8 text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-500">Click to upload an image</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
