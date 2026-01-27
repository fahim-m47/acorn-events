'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BlastForm } from './blast-form'

interface BlastDialogProps {
  eventId: string
  eventTitle: string
  trigger?: React.ReactNode
}

export function BlastDialog({ eventId, eventTitle, trigger }: BlastDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Send Update
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Send Update</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Send a message to everyone who saved {eventTitle}
          </DialogDescription>
        </DialogHeader>
        <BlastForm
          eventId={eventId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
