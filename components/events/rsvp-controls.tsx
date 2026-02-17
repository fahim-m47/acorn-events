"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { joinEvent, leaveEvent } from "@/actions/rsvps"
import { buildLoginPath } from "@/lib/auth-redirect"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { RegistrationStatus } from "@/types"

interface RsvpControlsProps {
  eventId: string
  isAuthenticated: boolean
  isFull: boolean
  userStatus: RegistrationStatus | null
  waitlistPosition: number | null
}

export function RsvpControls({
  eventId,
  isAuthenticated,
  isFull,
  userStatus,
  waitlistPosition,
}: RsvpControlsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

  const loginIntent = isFull ? "waitlist" : "rsvp"
  const loginHref = buildLoginPath(`/events/${eventId}?intent=${loginIntent}`)

  const handleJoin = () => {
    setError(null)

    startTransition(async () => {
      const result = await joinEvent(eventId)
      if (result.error) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  const handleLeave = () => {
    setError(null)

    startTransition(async () => {
      const result = await leaveEvent(eventId)
      if (result.error) {
        setError(result.error)
        return
      }

      setIsLeaveDialogOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {!isAuthenticated && (
        <Button asChild>
          <Link href={loginHref}>{isFull ? "Join Waitlist" : "RSVP"}</Link>
        </Button>
      )}

      {isAuthenticated && userStatus === "going" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled
            variant="outline"
            className="border-zinc-700 bg-zinc-800 text-zinc-300"
          >
            You&apos;re Going
          </Button>

          <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                Un-RSVP
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-zinc-100">Leave this event?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  You will lose your confirmed RSVP for this event.
                  {isFull &&
                    " This event is currently at max capacity, so if you join again you will be placed on the waitlist."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLeave}
                  disabled={isPending}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {isAuthenticated && userStatus === "waitlist" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled
            variant="outline"
            className="border-amber-500/40 bg-amber-500/15 text-amber-100"
          >
            Waitlisted {waitlistPosition ? `#${waitlistPosition}` : ""}
          </Button>
          <Button
            onClick={handleLeave}
            disabled={isPending}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-200"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Leave Waitlist"
            )}
          </Button>
        </div>
      )}

      {isAuthenticated && !userStatus && (
        <Button onClick={handleJoin} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isFull ? (
            "Join Waitlist"
          ) : (
            "RSVP"
          )}
        </Button>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
