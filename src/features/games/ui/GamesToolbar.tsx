import { Button, Input, Select, Space } from 'antd'

import { PLATFORM_CATALOG } from '../../../shared/constants/platforms'
import type { GameStatus, Platform, PlatformFamily } from '../../../shared/types/game'

const platformFamilyLabel: Record<PlatformFamily, string> = {
  nintendo: 'Nintendo',
  playstation: 'PlayStation',
  microsoft: 'Microsoft',
  sega: 'Sega',
  atari: 'Atari',
  commodore: 'Commodore',
  pc: 'PC',
}

const platformLabel: Partial<Record<Platform, string>> = {
  nes: 'NES',
  snes: 'SNES',
  'nintendo-64': 'Nintendo 64',
  gamecube: 'GameCube',
  wii: 'Wii',
  'wii-u': 'Wii U',
  switch: 'Switch',
  'switch-2': 'Switch 2',
  'game-boy': 'Game Boy',
  'game-boy-color': 'Game Boy Color',
  'game-boy-advance': 'Game Boy Advance',
  'nintendo-ds': 'Nintendo DS',
  'nintendo-3ds': 'Nintendo 3DS',
  ps1: 'PS1',
  ps2: 'PS2',
  ps3: 'PS3',
  ps4: 'PS4',
  ps5: 'PS5',
  psp: 'PSP',
  'ps-vita': 'PS Vita',
  xbox: 'Xbox',
  'xbox-360': 'Xbox 360',
  'xbox-one': 'Xbox One',
  'xbox-series-xs': 'Xbox Series X|S',
  'master-system': 'Master System',
  'mega-drive-genesis': 'Mega Drive / Genesis',
  'sega-cd': 'Sega CD',
  'sega-32x': 'Sega 32X',
  saturn: 'Saturn',
  dreamcast: 'Dreamcast',
  'game-gear': 'Game Gear',
  'atari-2600': 'Atari 2600',
  'atari-5200': 'Atari 5200',
  'atari-7800': 'Atari 7800',
  'atari-lynx': 'Atari Lynx',
  'atari-jaguar': 'Atari Jaguar',
  'commodore-64': 'Commodore 64',
  amiga: 'Amiga',
  pc: 'PC',
  playstation: 'PlayStation',
  mobile: 'Mobile',
  other: 'Otra',
}

const platformOptions: Array<{ label: string; value: Platform | 'all' }> = [
  { label: 'Todas las plataformas', value: 'all' },
  ...Object.values(PLATFORM_CATALOG)
    .flat()
    .map((value) => ({ label: platformLabel[value] ?? value, value })),
]

const platformFamilyOptions: Array<{ label: string; value: PlatformFamily | 'all' }> = [
  { label: 'Todas las familias', value: 'all' },
  ...Object.keys(PLATFORM_CATALOG).map((family) => ({
    label: platformFamilyLabel[family as PlatformFamily],
    value: family as PlatformFamily,
  })),
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
  platformFamilyFilter: PlatformFamily | 'all'
  platformFilter: Platform | 'all'
  statusFilter: GameStatus | 'all'
  onSearchChange: (value: string) => void
  onPlatformFamilyFilterChange: (value: PlatformFamily | 'all') => void
  onPlatformFilterChange: (value: Platform | 'all') => void
  onStatusFilterChange: (value: GameStatus | 'all') => void
  onCreate: () => void
}

export function GamesToolbar({
  search,
  platformFamilyFilter,
  platformFilter,
  statusFilter,
  onSearchChange,
  onPlatformFamilyFilterChange,
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
          options={platformFamilyOptions}
          value={platformFamilyFilter}
          onChange={onPlatformFamilyFilterChange}
          style={{ width: 210 }}
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
