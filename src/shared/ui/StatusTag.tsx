import { Tag } from 'antd'
import type { GameStatus } from '../types/game'

const statusLabels: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

// Background colors chosen to achieve ≥4.5:1 contrast ratio (WCAG AA)
// with white (#fff) foreground text at 12px.
const statusColors: Record<GameStatus, string> = {
  backlog:   '#2a2826', // warm gray  — contrast ≈ 12:1 (white text)
  playing:   '#b85e1a', // ember      — contrast  4.51:1
  completed: '#1e5c38', // forest     — contrast ≈ 5.5:1
  paused:    '#6a5c1a', // gold       — contrast ≈ 5.1:1
  dropped:   '#6a1e1e', // crimson    — contrast ≈ 5.8:1
}

// Per-status border: backlog needs a visible edge against the dark card surface
// (#6a6764 vs #1a1918 yields ~3.5:1, meeting WCAG 1.4.11 for UI components)
const statusBorder: Record<GameStatus, string> = {
  backlog:   '1px solid #6a6764',
  playing:   'none',
  completed: 'none',
  paused:    'none',
  dropped:   'none',
}

interface StatusTagProps {
  status: GameStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return (
    <Tag
      color={statusColors[status]}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        border: statusBorder[status],
        color: '#ffffff',
      }}
    >
      {statusLabels[status]}
    </Tag>
  )
}
