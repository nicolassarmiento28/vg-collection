import type { Game } from '../../../shared/types/game'

export function getBacklogGames(games: Game[]): Game[] {
  return games.filter((game) => game.status === 'backlog')
}

/** Picks a random game from the backlog only (never from the full collection). */
export function pickRandomBacklogGame(games: Game[], random: () => number = Math.random): Game | null {
  const backlog = getBacklogGames(games)
  if (backlog.length === 0) return null
  const index = Math.floor(random() * backlog.length)
  return backlog[index] ?? null
}
