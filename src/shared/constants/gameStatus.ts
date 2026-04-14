// src/shared/constants/gameStatus.ts
import type { GameStatus } from '../types/game'

/** Ant Design Tag color strings — used in CollectionDetailPage */
export const STATUS_TAG_COLORS: Record<GameStatus, string> = {
  backlog: 'default',
  playing: 'orange',
  completed: 'green',
  paused: 'blue',
  dropped: 'red',
}

/** Human-readable Spanish labels */
export const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

/** Rich badge colors — used in CollectionPage cards */
export const STATUS_BADGE_COLORS: Record<GameStatus, { bg: string; text: string; label: string }> = {
  backlog:   { bg: 'rgba(127,140,141,0.2)', text: '#7f8c8d', label: 'Backlog' },
  playing:   { bg: 'rgba(230,126,34,0.2)',  text: '#e67e22', label: 'Jugando' },
  completed: { bg: 'rgba(39,174,96,0.2)',   text: '#27ae60', label: 'Completado' },
  paused:    { bg: 'rgba(52,152,219,0.2)',  text: '#3498db', label: 'Pausado' },
  dropped:   { bg: 'rgba(192,57,43,0.2)',   text: '#c0392b', label: 'Abandonado' },
}
