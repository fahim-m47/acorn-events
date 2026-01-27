'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createBlast } from '@/actions/blasts'

interface BlastFormProps {
  eventId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const MAX_CONTENT_LENGTH = 500

export function BlastForm({ eventId, onSuccess, onCancel }: BlastFormProps) {
  const [content, setContent] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData()
    formData.append('content', content)
    formData.append('event_id', eventId)

    try {
      const result = await createBlast(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
        onSuccess?.()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content">Update message</Label>
        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
          placeholder="Share an update with attendees..."
          rows={4}
          maxLength={MAX_CONTENT_LENGTH}
          className="bg-zinc-900 border-zinc-800 resize-none"
        />
        <div className="flex justify-end">
          <span className="text-sm text-zinc-500">
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="border-zinc-800 text-zinc-100 hover:bg-zinc-800"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending || content.trim().length === 0}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Update'
          )}
        </Button>
      </div>
    </form>
  )
}
