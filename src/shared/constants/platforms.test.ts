import { describe, expect, it } from 'vitest'

import {
  getFamilyByPlatform,
  getPlatformsByFamily,
  isPortablePlatform,
  PLATFORM_CATALOG,
} from './platforms'

describe('platform catalog', () => {
  it('includes Nintendo handheld platforms within Nintendo family', () => {
    const nintendoPlatforms = getPlatformsByFamily('nintendo')

    expect(nintendoPlatforms).toContain('game-boy')
    expect(nintendoPlatforms).toContain('nintendo-3ds')
  })

  it('maps platform to the correct family', () => {
    expect(getFamilyByPlatform('ps-vita')).toBe('playstation')
    expect(getFamilyByPlatform('xbox')).toBe('microsoft')
  })

  it('detects portable platforms correctly', () => {
    expect(isPortablePlatform('game-gear')).toBe(true)
    expect(isPortablePlatform('ps5')).toBe(false)
  })

  it('does not contain duplicated platforms across families', () => {
    const allSpecificPlatforms = Object.values(PLATFORM_CATALOG).flat()
    const uniquePlatforms = new Set(allSpecificPlatforms)

    expect(uniquePlatforms.size).toBe(allSpecificPlatforms.length)
  })
})
