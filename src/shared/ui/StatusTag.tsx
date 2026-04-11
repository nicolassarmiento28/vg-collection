import { Tag } from 'antd'

import type { GameStatus } from '../types/game'

const statusLabels: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Jugando',
  completed: 'Completado',
  paused: 'Pausado',
  dropped: 'Abandonado',
}

const statusColors: Record<GameStatus, string> = {
  backlog: 'default',
  playing: 'processing',
  completed: 'success',
  paused: 'warning',
  dropped: 'error',
}

interface StatusTagProps {
  status: GameStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
}
