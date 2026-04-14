import { Tag } from 'antd'
import type { GameStatus } from '../types/game'

const statusLabels: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

// Hex colors that work on the dark ember theme background
const statusColors: Record<GameStatus, string> = {
  backlog: '#3a3836',    // dark warm gray
  playing: '#e07a2f',   // ember orange
  completed: '#2e7d52', // forest green
  paused: '#8a7a2f',    // muted gold
  dropped: '#7a2e2e',   // muted crimson
}

interface StatusTagProps {
  status: GameStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return (
    <Tag
      color={statusColors[status]}
      style={{ fontFamily: 'var(--font-body)', fontSize: 12, border: 'none' }}
    >
      {statusLabels[status]}
    </Tag>
  )
}
