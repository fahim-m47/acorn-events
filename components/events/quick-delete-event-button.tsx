"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { deleteEvent } from "@/actions/events"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface QuickDeleteEventButtonProps {
  eventId: string
  className?: string
}

export function QuickDeleteEventButton({ eventId, className }: QuickDeleteEventButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDeleting) return
    setIsDeleting(true)

    try {
      const result = await deleteEvent(eventId)
      if (result?.error) {
        toast({
          title: "Could not delete event",
          description: result.error,
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      router.refresh()
    } catch {
      toast({
        title: "Could not delete event",
        description: "Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="destructive"
      aria-label="Delete event"
      disabled={isDeleting}
      onClick={handleDelete}
      className={cn("h-8 w-8 rounded-full", className)}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
