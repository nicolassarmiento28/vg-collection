import { Button, Input, Select, Space } from 'antd'

import type { GameStatus, Platform } from '../../../shared/types/game'

const platformOptions: Array<{ label: string; value: Platform | 'all' }> = [
  { label: 'Todas las plataformas', value: 'all' },
  { label: 'PC', value: 'pc' },
  { label: 'PlayStation', value: 'playstation' },
  { label: 'Xbox', value: 'xbox' },
  { label: 'Switch', value: 'switch' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Otra', value: 'other' },
]

const statusOptions: Array<{ label: string; value: GameStatus | 'all' }> = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

interface GamesToolbarProps {
  search: string
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
  onSearchChange: (value: string) => void
  onPlatformFilterChange: (value: Platform | 'all') => void
  onStatusFilterChange: (value: GameStatus | 'all') => void
  onCreate: () => void
}

export function GamesToolbar({
  search,
  platformFilter,
  statusFilter,
  onSearchChange,
  onPlatformFilterChange,
  onStatusFilterChange,
  onCreate,
}: GamesToolbarProps) {
  return (
    <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
      <Space wrap>
        <Input
          allowClear
          placeholder="Buscar por titulo"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ width: 240 }}
        />
        <Select
          options={platformOptions}
          value={platformFilter}
          onChange={onPlatformFilterChange}
          style={{ width: 200 }}
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          style={{ width: 180 }}
        />
      </Space>
      <Button type="primary" onClick={onCreate}>
        Crear juego
      </Button>
    </Space>
  )
}
