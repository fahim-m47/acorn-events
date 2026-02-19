type HostNameSource = {
  host_display_name?: string | null
  creator?: {
    name: string | null
  } | null
}

export function hasHostDisplayNameOverride(event: Pick<HostNameSource, 'host_display_name'>): boolean {
  return Boolean(event.host_display_name?.trim())
}

export function getEventHostDisplayName(event: HostNameSource): string {
  return event.host_display_name?.trim() || event.creator?.name || 'Unknown host'
}
