import { describe, expect, it } from 'vitest'

import { normalizeOptionalRating } from './normalizeOptionalRating'

describe('normalizeOptionalRating', () => {
  it('maps null to undefined', () => {
    expect(normalizeOptionalRating(null)).toBeUndefined()
  })

  it('keeps numbers and undefined unchanged', () => {
    expect(normalizeOptionalRating(8)).toBe(8)
    expect(normalizeOptionalRating(undefined)).toBeUndefined()
  })
})
