export function slugifyOpponent(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateGameId(
  sportSlug: string,
  dateStr: string,
  opponent: string
): string {
  return `${sportSlug}-${dateStr}-${slugifyOpponent(opponent)}`
}

export function getGamePath(sportSlug: string, gameId: string): string {
  return `/sports/${sportSlug}/games/${gameId}`
}
