export type PlatformFamily =
  | 'nintendo'
  | 'playstation'
  | 'microsoft'
  | 'sega'
  | 'atari'
  | 'commodore'
  | 'pc'

export type Platform =
  | 'nes'
  | 'snes'
  | 'nintendo-64'
  | 'gamecube'
  | 'wii'
  | 'wii-u'
  | 'switch'
  | 'switch-2'
  | 'game-boy'
  | 'game-boy-color'
  | 'game-boy-advance'
  | 'nintendo-ds'
  | 'nintendo-3ds'
  | 'ps1'
  | 'ps2'
  | 'ps3'
  | 'ps4'
  | 'ps5'
  | 'psp'
  | 'ps-vita'
  | 'xbox'
  | 'xbox-360'
  | 'xbox-one'
  | 'xbox-series-xs'
  | 'master-system'
  | 'mega-drive-genesis'
  | 'sega-cd'
  | 'sega-32x'
  | 'saturn'
  | 'dreamcast'
  | 'game-gear'
  | 'atari-2600'
  | 'atari-5200'
  | 'atari-7800'
  | 'atari-lynx'
  | 'atari-jaguar'
  | 'commodore-64'
  | 'amiga'
  | 'pc'
  | 'playstation'
  | 'mobile'
  | 'other'

export const PLATFORM_CATALOG: Record<PlatformFamily, Platform[]> = {
  nintendo: [
    'nes',
    'snes',
    'nintendo-64',
    'gamecube',
    'wii',
    'wii-u',
    'switch',
    'switch-2',
    'game-boy',
    'game-boy-color',
    'game-boy-advance',
    'nintendo-ds',
    'nintendo-3ds',
  ],
  playstation: ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'psp', 'ps-vita'],
  microsoft: ['xbox', 'xbox-360', 'xbox-one', 'xbox-series-xs'],
  sega: [
    'master-system',
    'mega-drive-genesis',
    'sega-cd',
    'sega-32x',
    'saturn',
    'dreamcast',
    'game-gear',
  ],
  atari: ['atari-2600', 'atari-5200', 'atari-7800', 'atari-lynx', 'atari-jaguar'],
  commodore: ['commodore-64', 'amiga'],
  pc: ['pc'],
}

const portablePlatforms = new Set<Platform>([
  'game-boy',
  'game-boy-color',
  'game-boy-advance',
  'nintendo-ds',
  'nintendo-3ds',
  'psp',
  'ps-vita',
  'game-gear',
  'atari-lynx',
])

const familyByPlatform = Object.entries(PLATFORM_CATALOG).reduce(
  (accumulator, [family, platforms]) => {
    for (const platform of platforms) {
      accumulator[platform] = family as PlatformFamily
    }

    return accumulator
  },
  {} as Record<Platform, PlatformFamily>,
)

export function getPlatformsByFamily(family: PlatformFamily): Platform[] {
  return PLATFORM_CATALOG[family]
}

export function getFamilyByPlatform(platform: Platform): PlatformFamily | undefined {
  return familyByPlatform[platform]
}

export function isPortablePlatform(platform: Platform): boolean {
  return portablePlatforms.has(platform)
}
