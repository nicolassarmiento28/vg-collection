import { STATUS_LABELS } from '../../../shared/constants/gameStatus'
import { PLATFORM_LABELS, type Game, type GameStatus } from '../../../shared/types/game'

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
// countByStatus (abajo) complementa esto con el desglose completo por estado.
export function computeCompletionStats(games: Game[]): CompletionStats {
  const total = games.length
  const completed = games.filter((game) => game.status === 'completed').length
  const percentCompleted = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percentCompleted }
}

export interface StatusCountEntry {
  status: GameStatus
  label: string
  count: number
}

const STATUS_ORDER: GameStatus[] = ['completed', 'playing', 'backlog', 'paused', 'dropped']

/** Full breakdown by status, in a fixed order, omitting statuses with zero games. */
export function countByStatus(games: Game[]): StatusCountEntry[] {
  const counts = new Map<GameStatus, number>()
  for (const game of games) {
    counts.set(game.status, (counts.get(game.status) ?? 0) + 1)
  }
  return STATUS_ORDER.filter((status) => (counts.get(status) ?? 0) > 0).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
  }))
}
