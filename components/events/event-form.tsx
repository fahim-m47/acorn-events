"use client"

import { useState, useRef } from "react"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import Image from "next/image"
import { Loader2, Upload, X, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Event } from "@/types"

interface EventFormProps {
  initialData?: Partial<Event> & { capacity?: number | null }
  action: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel?: string
}

export function EventForm({ initialData, action, submitLabel = "Create Event" }: EventFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  )
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">(
    initialData?.capacity ? "limited" : "unlimited"
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatDateTimeLocal = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    // dateStr is UTC ISO string. We want to display it as New York time.
    // formatInTimeZone takes the UTC date and formats it in the target timezone
    return formatInTimeZone(dateStr, TIMEZONE, "yyyy-MM-dd'T'HH:mm")
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
    
    // Validate file size (50MB)
    if (file && file.size > 50 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, form: "Image size must be less than 50MB" }))
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
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

    // Handle capacity based on type
    if (capacityType === "unlimited") {
      formData.set("capacity", "")
    }

    // Client-side validation
    const title = formData.get("title") as string
    const location = formData.get("location") as string
    const startTime = formData.get("start_time") as string

    const newErrors: Record<string, string> = {}

    if (!title?.trim()) {
      newErrors.title = "Title is required"
    }

    if (!location?.trim()) {
      newErrors.location = "Location is required"
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

      {/* Two-column layout: Image on left, form on right */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Image Upload */}
        <div className="w-full lg:w-1/3">
          <Label className="mb-2 block">Event Image</Label>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-haver-dark-red/40">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-haver-dark-red/80 hover:bg-haver-dark-red transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-300" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center aspect-[3/4] w-full rounded-lg border-2 border-dashed border-haver-dark-red/40 bg-haver-dark-red/10 cursor-pointer hover:border-haver-dark-red/60 transition-colors"
              >
                <Upload className="h-8 w-8 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-500">Click to upload an image</p>
                <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 50MB</p>
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
            <input 
              type="hidden" 
              name="remove_image" 
              value={imagePreview ? "false" : "true"} 
            />
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={initialData?.title || ""}
              placeholder="Event title"
              className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red"
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Time Selection - styled like reference */}
          <div className="space-y-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Start *
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(initialData?.start_time)}
                    className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red"
                  />
                </div>
                <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-haver-dark-red/20 border border-haver-dark-red/30">
                  GMT-05:00 New York
                </span>
              </div>
              {errors.start_time && (
                <p className="text-sm text-red-400">{errors.start_time}</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                End
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(initialData?.end_time)}
                    className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Add Event Location *</Label>
            <Input
              id="location"
              name="location"
              defaultValue={initialData?.location || ""}
              placeholder="Offline location or virtual link"
              className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red"
            />
            {errors.location && (
              <p className="text-sm text-red-400">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Add Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              placeholder="Tell people about your event..."
              rows={4}
              className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red resize-none"
            />
          </div>

          {/* Event Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Event Link</Label>
            <Input
              id="link"
              name="link"
              type="url"
              defaultValue={initialData?.link || ""}
              placeholder="https://..."
              className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red"
            />
          </div>

          {/* Event Options Section */}
          <div className="space-y-4 pt-4 border-t border-haver-dark-red/30">
            <h3 className="text-sm font-medium text-zinc-300">Event Options</h3>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setCapacityType("unlimited")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    capacityType === "unlimited"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-haver-dark-red/20 border-haver-dark-red/40 text-zinc-400 hover:border-haver-dark-red/60"
                  }`}
                >
                  Unlimited
                </button>
                <button
                  type="button"
                  onClick={() => setCapacityType("limited")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    capacityType === "limited"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-haver-dark-red/20 border-haver-dark-red/40 text-zinc-400 hover:border-haver-dark-red/60"
                  }`}
                >
                  Limited
                </button>
                {capacityType === "limited" && (
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    placeholder="Enter max attendees"
                    defaultValue={initialData?.capacity || ""}
                    className="bg-haver-dark-red/20 border-haver-dark-red/40 focus:border-haver-dark-red w-40"
                  />
                )}
                {capacityType === "unlimited" && (
                  <input type="hidden" name="capacity" value="" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-haver-dark-red/30">
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
