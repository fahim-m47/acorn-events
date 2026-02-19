"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  addDays,
  addMinutes,
  addMonths,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm"
const TIME_STEP_MINUTES = 30
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

type PickerPanel = "date" | "time" | null

interface TimeOption {
  hours: number
  minutes: number
  value: string
}

export interface DateTimePickerProps {
  id: string
  name: string
  value: string
  onChange: (nextValue: string) => void
  minDateTimeValue?: string
  allowClear?: boolean
  className?: string
  durationFromValue?: string
}

const TIME_OPTIONS: TimeOption[] = Array.from(
  { length: (24 * 60) / TIME_STEP_MINUTES },
  (_, index) => {
    const hours = Math.floor((index * TIME_STEP_MINUTES) / 60)
    const minutes = (index * TIME_STEP_MINUTES) % 60
    const date = new Date(2000, 0, 1, hours, minutes, 0, 0)

    return {
      hours,
      minutes,
      value: format(date, "hh:mm a"),
    }
  }
)

const parseDateTimeLocal = (value: string): Date | null => {
  if (!value) return null

  const parsedDate = parse(value, DATETIME_LOCAL_FORMAT, new Date())
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

const formatDateTimeLocal = (date: Date): string => format(date, DATETIME_LOCAL_FORMAT)

const roundToNextTimeStep = (date: Date) => {
  const rounded = new Date(date)
  rounded.setSeconds(0, 0)
  const minuteRemainder = rounded.getMinutes() % TIME_STEP_MINUTES

  if (minuteRemainder !== 0) {
    rounded.setMinutes(rounded.getMinutes() + (TIME_STEP_MINUTES - minuteRemainder))
  }

  return rounded
}

const buildDurationLabel = (minutesDifference: number) => {
  const hours = Math.floor(minutesDifference / 60)
  const minutes = minutesDifference % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function DateTimePicker({
  id,
  name,
  value,
  onChange,
  minDateTimeValue,
  allowClear = false,
  className,
  durationFromValue,
}: DateTimePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const selectedTimeRef = useRef<HTMLButtonElement>(null)
  const [openPanel, setOpenPanel] = useState<PickerPanel>(null)
  const selectedDateTime = useMemo(() => parseDateTimeLocal(value), [value])
  const minDateTime = useMemo(
    () => parseDateTimeLocal(minDateTimeValue ?? ""),
    [minDateTimeValue]
  )
  const durationBaseDateTime = useMemo(
    () => parseDateTimeLocal(durationFromValue ?? ""),
    [durationFromValue]
  )

  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(selectedDateTime ?? new Date())
  )

  useEffect(() => {
    if (selectedDateTime) {
      setVisibleMonth(startOfMonth(selectedDateTime))
    }
  }, [selectedDateTime])

  useEffect(() => {
    if (!openPanel) return

    const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpenPanel(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPanel(null)
      }
    }

    document.addEventListener("mousedown", handleOutsidePointer)
    document.addEventListener("touchstart", handleOutsidePointer)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer)
      document.removeEventListener("touchstart", handleOutsidePointer)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [openPanel])

  useEffect(() => {
    if (openPanel !== "time") return
    const timeoutId = window.setTimeout(() => {
      selectedTimeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
    }, 40)

    return () => window.clearTimeout(timeoutId)
  }, [openPanel, value])

  const activeDate =
    selectedDateTime ??
    (minDateTime
      ? addMinutes(minDateTime, TIME_STEP_MINUTES)
      : roundToNextTimeStep(new Date()))
  const monthStart = startOfMonth(visibleMonth)
  const calendarStart = addDays(monthStart, -getDay(monthStart))
  const calendarDays = Array.from({ length: 42 }, (_, index) =>
    addDays(calendarStart, index)
  )
  const availableTimeOptions = useMemo(
    () =>
      TIME_OPTIONS.filter((option) => {
        const optionDate = new Date(activeDate)
        optionDate.setHours(option.hours, option.minutes, 0, 0)
        return !minDateTime || optionDate > minDateTime
      }),
    [activeDate, minDateTime]
  )

  const updateDate = (pickedDate: Date) => {
    const nextDate = new Date(pickedDate)
    nextDate.setHours(activeDate.getHours(), activeDate.getMinutes(), 0, 0)

    if (minDateTime && nextDate <= minDateTime) {
      const firstValidOption = TIME_OPTIONS.find((option) => {
        const optionDate = new Date(pickedDate)
        optionDate.setHours(option.hours, option.minutes, 0, 0)
        return optionDate > minDateTime
      })

      if (!firstValidOption) {
        return
      }

      nextDate.setHours(firstValidOption.hours, firstValidOption.minutes, 0, 0)
    }

    onChange(formatDateTimeLocal(nextDate))
    setOpenPanel(null)
  }

  const updateTime = (hours: number, minutes: number) => {
    const nextDate = new Date(activeDate)
    nextDate.setHours(hours, minutes, 0, 0)

    if (minDateTime && nextDate <= minDateTime) {
      return
    }

    onChange(formatDateTimeLocal(nextDate))
    setOpenPanel(null)
  }

  const clearValue = () => {
    onChange("")
    setOpenPanel(null)
  }

  const selectedDateLabel = selectedDateTime
    ? format(selectedDateTime, "EEE, MMM d")
    : "Pick a date"
  const selectedTimeLabel = selectedDateTime
    ? format(selectedDateTime, "h:mm a")
    : "Pick time"

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input id={id} name={name} type="hidden" value={value} />

      <div className="flex overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-800/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <button
          type="button"
          onClick={() => setOpenPanel((current) => (current === "date" ? null : "date"))}
          className={cn(
            "flex min-h-12 min-w-[10.5rem] flex-1 items-center gap-2 border-r border-zinc-700/80 px-3.5 text-left text-lg font-medium leading-none tracking-tight transition-colors sm:min-w-[12rem] sm:px-4 sm:text-xl",
            openPanel === "date"
              ? "bg-zinc-700/60 text-zinc-100"
              : "text-zinc-100 hover:bg-zinc-700/30"
          )}
          aria-haspopup="dialog"
          aria-expanded={openPanel === "date"}
        >
          <Calendar className="h-4 w-4 shrink-0 text-zinc-400 sm:h-5 sm:w-5" />
          <span
            className={cn(
              "truncate whitespace-nowrap",
              selectedDateTime ? "text-zinc-100" : "text-zinc-500"
            )}
          >
            {selectedDateLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpenPanel((current) => (current === "time" ? null : "time"))}
          className={cn(
            "flex min-h-12 w-[10.5rem] shrink-0 items-center gap-2 px-3.5 text-left text-lg font-medium leading-none tracking-tight transition-colors sm:w-[11.5rem] sm:px-4 sm:text-xl",
            openPanel === "time"
              ? "bg-zinc-700/60 text-zinc-100"
              : "text-zinc-100 hover:bg-zinc-700/30"
          )}
          aria-haspopup="dialog"
          aria-expanded={openPanel === "time"}
        >
          <Clock className="h-4 w-4 shrink-0 text-zinc-400 sm:h-5 sm:w-5" />
          <span
            className={cn(
              "truncate whitespace-nowrap",
              selectedDateTime ? "text-zinc-100" : "text-zinc-500"
            )}
          >
            {selectedTimeLabel}
          </span>
        </button>
      </div>

      {allowClear && selectedDateTime && (
        <button
          type="button"
          onClick={clearValue}
          className="absolute -right-2 -top-2 rounded-full border border-zinc-600 bg-zinc-900 p-1 text-zinc-300 transition-colors hover:text-zinc-100"
          aria-label="Clear date and time"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {openPanel && (
        <div
          className={cn(
            "absolute z-50 mt-3 w-[min(94vw,32rem)] rounded-[1.6rem] border border-zinc-700/80 bg-zinc-950/90 p-4 backdrop-blur-xl shadow-[0_24px_54px_-24px_rgba(0,0,0,0.95)]",
            openPanel === "date" ? "left-0" : "right-0"
          )}
        >
          <div
            className={cn(
              "absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-zinc-700/80 bg-zinc-950/95",
              openPanel === "date" ? "left-12" : "right-12"
            )}
          />

          {openPanel === "date" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-3xl font-semibold tracking-tight text-zinc-100">
                  {format(visibleMonth, "MMMM")}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="text-center text-sm font-medium uppercase tracking-wide text-zinc-500"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, visibleMonth)
                  const isSelectedDay = selectedDateTime
                    ? isSameDay(day, selectedDateTime)
                    : false
                  const isToday = isSameDay(day, new Date())
                  const hasValidTimeOption = TIME_OPTIONS.some((option) => {
                    const optionDate = new Date(day)
                    optionDate.setHours(option.hours, option.minutes, 0, 0)
                    return !minDateTime || optionDate > minDateTime
                  })

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={!hasValidTimeOption}
                      onClick={() => updateDate(day)}
                      className={cn(
                        "relative h-11 rounded-xl text-lg font-medium transition-colors",
                        isSelectedDay &&
                          "bg-zinc-100/20 text-zinc-100 ring-1 ring-zinc-200/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                        !isSelectedDay &&
                          isCurrentMonth &&
                          "text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100",
                        !isCurrentMonth && "text-zinc-600 hover:bg-zinc-900 hover:text-zinc-300",
                        isToday && !isSelectedDay && "ring-1 ring-zinc-600",
                        !hasValidTimeOption &&
                          !isSelectedDay &&
                          "cursor-not-allowed bg-zinc-900/40 text-zinc-600/70 hover:bg-zinc-900/40 hover:text-zinc-600/70"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="max-h-[22rem] space-y-1 overflow-y-auto pr-1">
              {availableTimeOptions.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-zinc-400">
                  No end times available for this day. Pick a later date.
                </p>
              )}
              {availableTimeOptions.map((option) => {
                const optionDate = new Date(activeDate)
                optionDate.setHours(option.hours, option.minutes, 0, 0)
                const isSelectedTime =
                  !!selectedDateTime &&
                  selectedDateTime.getHours() === option.hours &&
                  selectedDateTime.getMinutes() === option.minutes
                const durationLabel =
                  durationBaseDateTime && optionDate > durationBaseDateTime
                    ? buildDurationLabel(
                        Math.round(
                          (optionDate.getTime() - durationBaseDateTime.getTime()) / (1000 * 60)
                        )
                      )
                    : null

                return (
                  <button
                    key={option.value}
                    ref={isSelectedTime ? selectedTimeRef : undefined}
                    type="button"
                    onClick={() => updateTime(option.hours, option.minutes)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left text-2xl font-medium tracking-tight transition-colors sm:text-3xl",
                      isSelectedTime
                        ? "bg-zinc-100/20 text-zinc-100 ring-1 ring-zinc-200/35"
                        : "text-zinc-100 hover:bg-zinc-800"
                    )}
                  >
                    <span>{option.value}</span>
                    {durationLabel && (
                      <span
                        className={cn(
                          "ml-4 text-xl sm:text-2xl",
                          isSelectedTime ? "text-zinc-300" : "text-zinc-400"
                        )}
                      >
                        {durationLabel}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
