import { describe, expect, it } from 'vitest'
import type { Game } from '../../../shared/types/game'
import { buildExportFilename, parseImportedCollection, serializeCollection } from './importExport'

const validGame: Game = {
  id: 'g-1',
  title: 'Halo Infinite',
  platform: 'xbox',
  status: 'backlog',
  genre: 'Shooter',
  year: 2021,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('buildExportFilename', () => {
  it('embeds a timestamp and ends in .json', () => {
    const name = buildExportFilename(new Date('2026-03-05T10:20:30.000Z'))
    expect(name).toBe('vg-collection-2026-03-05T10-20-30-000Z.json')
  })
})

describe('serializeCollection / parseImportedCollection round-trip', () => {
  it('parses back the same games it serialized', () => {
    const serialized = serializeCollection([validGame])
    const parsed = parseImportedCollection(serialized)
    expect(parsed).toEqual([validGame])
  })

  it('rejects invalid JSON', () => {
    expect(parseImportedCollection('not json')).toBeNull()
  })

  it('rejects JSON that is not an array', () => {
    expect(parseImportedCollection(JSON.stringify({ games: [validGame] }))).toBeNull()
  })

  it('rejects an array containing a malformed game', () => {
    const malformed = { ...validGame, year: 'not-a-number' }
    expect(parseImportedCollection(JSON.stringify([malformed]))).toBeNull()
  })
})
