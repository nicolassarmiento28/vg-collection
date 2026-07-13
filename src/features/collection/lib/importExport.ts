import type { Game } from '../../../shared/types/game'
import { isValidGame } from '../../../shared/lib/storage/gamesStorage'

export function buildExportFilename(date: Date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, '-')
  return `vg-collection-${stamp}.json`
}

export function serializeCollection(games: Game[]): string {
  return JSON.stringify(games, null, 2)
}

/** Returns the parsed games, or null if the file doesn't match the Game[] shape. */
export function parseImportedCollection(text: string): Game[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidGame)) {
    return null
  }

  return parsed
}

export function downloadCollection(games: Game[]): void {
  const blob = new Blob([serializeCollection(games)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = buildExportFilename()
  link.click()
  URL.revokeObjectURL(url)
}
