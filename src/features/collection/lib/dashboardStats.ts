import { PLATFORM_LABELS, type Game } from '../../../shared/types/game'

export interface CountEntry {
  label: string
  count: number
}

function toSortedEntries(map: Map<string, number>): CountEntry[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export function countByPlatform(games: Game[]): CountEntry[] {
  const map = new Map<string, number>()
  for (const game of games) {
    const label = PLATFORM_LABELS[game.platform]
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return toSortedEntries(map)
}

export function countByGenre(games: Game[]): CountEntry[] {
  const map = new Map<string, number>()
  for (const game of games) {
    const label = game.genre.trim().length > 0 ? game.genre.trim() : 'Sin género'
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return toSortedEntries(map)
}

export function countByYear(games: Game[]): CountEntry[] {
  const map = new Map<number, number>()
  for (const game of games) {
    map.set(game.year, (map.get(game.year) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ label: String(year), count }))
}

export interface CompletionStats {
  completed: number
  total: number
  percentCompleted: number
}

// "Completado" vs. el resto de la colección (backlog/jugando/pausado/abandonado),
// no solo status === 'backlog' — es la métrica de avance más útil de un vistazo.
export function computeCompletionStats(games: Game[]): CompletionStats {
  const total = games.length
  const completed = games.filter((game) => game.status === 'completed').length
  const percentCompleted = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percentCompleted }
}
