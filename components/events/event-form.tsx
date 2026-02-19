"use client"

import { useEffect, useRef, useState } from "react"
import { addMinutes, format, parse } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import Image from "next/image"
import { Loader2, Upload, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "./date-time-picker"
import type { Event } from "@/types"

interface EventFormProps {
  initialData?: Partial<Event> & { capacity?: number | null }
  action: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel?: string
}

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"

export function EventForm({ initialData, action, submitLabel = "Create Event" }: EventFormProps) {
  const formatDateTimeLocal = (dateStr: string | null | undefined) => {
    if (!dateStr) return ""
    // dateStr is UTC ISO string. We want to display it as New York time.
    // formatInTimeZone takes the UTC date and formats it in the target timezone
    return formatInTimeZone(dateStr, TIMEZONE, DATETIME_LOCAL_FORMAT)
  }

  const parseDateTimeLocal = (dateStr: string): Date | null => {
    if (!dateStr) return null
    const parsedDate = parse(dateStr, DATETIME_LOCAL_FORMAT, new Date())

    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    return parsedDate
  }

  const [isPending, setIsPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  )
  const [startDateTimeValue, setStartDateTimeValue] = useState(
    formatDateTimeLocal(initialData?.start_time)
  )
  const [endDateTimeValue, setEndDateTimeValue] = useState(
    formatDateTimeLocal(initialData?.end_time)
  )
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">(
    initialData?.capacity ? "limited" : "unlimited"
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timezoneOffset = formatInTimeZone(new Date(), TIMEZONE, "xxx")
  const timezoneAbbreviation = formatInTimeZone(new Date(), TIMEZONE, "zzz")
  const minimumStartDateTimeValue = formatInTimeZone(
    new Date(),
    TIMEZONE,
    DATETIME_LOCAL_FORMAT
  )

  const handleStartDateTimeChange = (nextValue: string) => {
    setStartDateTimeValue(nextValue)
    setErrors((prev) => {
      if (!prev.end_time) return prev
      const nextErrors = { ...prev }
      delete nextErrors.end_time
      return nextErrors
    })

    if (!nextValue || !endDateTimeValue) return

    const nextStartDate = parseDateTimeLocal(nextValue)
    const currentEndDate = parseDateTimeLocal(endDateTimeValue)

    if (!nextStartDate || !currentEndDate) return

    if (currentEndDate <= nextStartDate) {
      const nextEndDate = addMinutes(nextStartDate, 30)
      setEndDateTimeValue(format(nextEndDate, DATETIME_LOCAL_FORMAT))
    }
  }

  const handleEndDateTimeChange = (nextValue: string) => {
    setEndDateTimeValue(nextValue)
    setErrors((prev) => {
      if (!prev.end_time) return prev
      const nextErrors = { ...prev }
      delete nextErrors.end_time
      return nextErrors
    })
  }

  useEffect(() => {
    if (!startDateTimeValue || !endDateTimeValue) return

    const parsedStartDate = parseDateTimeLocal(startDateTimeValue)
    const parsedEndDate = parseDateTimeLocal(endDateTimeValue)

    if (!parsedStartDate || !parsedEndDate) return

    if (parsedEndDate <= parsedStartDate) {
      const correctedEndDate = addMinutes(parsedStartDate, 30)
      setEndDateTimeValue(format(correctedEndDate, DATETIME_LOCAL_FORMAT))
    }
  }, [startDateTimeValue, endDateTimeValue])

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
    const endTime = formData.get("end_time") as string

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

    if (startTime && endTime) {
      const startDate = parseDateTimeLocal(startTime)
      const endDate = parseDateTimeLocal(endTime)

      if (startDate && endDate && endDate <= startDate) {
        newErrors.end_time = "End time must be later than start time"
      }
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

          {/* Time Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-medium text-zinc-300">Date & Time</Label>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-900/45 px-3 py-1 text-xs text-zinc-400">
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                <span className="whitespace-nowrap">
                  New York ({timezoneAbbreviation}, GMT{timezoneOffset})
                </span>
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-zinc-700/70 bg-zinc-900/35 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-[5.5rem_1fr] sm:items-center">
                    <div className="flex items-center gap-2 text-zinc-200">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                      <span className="text-sm font-medium">Start *</span>
                    </div>
                    <DateTimePicker
                      id="start_time"
                      name="start_time"
                      value={startDateTimeValue}
                      onChange={handleStartDateTimeChange}
                      minDateTimeValue={minimumStartDateTimeValue}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[5.5rem_1fr] sm:items-center">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="h-2.5 w-2.5 rounded-full border border-zinc-500" />
                      <span className="text-sm font-medium">End</span>
                    </div>
                    <DateTimePicker
                      id="end_time"
                      name="end_time"
                      value={endDateTimeValue}
                      onChange={handleEndDateTimeChange}
                      minDateTimeValue={startDateTimeValue || undefined}
                      allowClear
                      durationFromValue={startDateTimeValue}
                    />
                  </div>
                </div>
              </div>
            </div>

            {errors.start_time && (
              <p className="text-sm text-red-400">{errors.start_time}</p>
            )}
            {errors.end_time && (
              <p className="text-sm text-red-400">{errors.end_time}</p>
            )}
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

          {/* RSVP Link */}
          <div className="space-y-2">
            <Label htmlFor="link">RSVP Link (e.g. Google Forms, Qualtrics)</Label>
            <Input
              id="link"
              name="link"
              type="url"
              defaultValue={initialData?.link || ""}
              placeholder="https://forms.gle/..."
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
