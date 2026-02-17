import type { RsvpAttendee } from "@/types"

interface RsvpAttendeesListProps {
  attendees: RsvpAttendee[]
}

export function RsvpAttendeesList({ attendees }: RsvpAttendeesListProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-lg font-semibold text-zinc-200">
        RSVPed Attendees ({attendees.length})
      </h2>
      {attendees.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No one has RSVPed yet.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {attendees.map((attendee) => (
            <div
              key={attendee.id}
              className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <span className="text-sm font-medium text-zinc-200">{attendee.name || "Unknown"}</span>
              <span className="text-sm text-zinc-400">{attendee.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
