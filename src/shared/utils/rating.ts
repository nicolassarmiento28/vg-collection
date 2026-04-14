// src/shared/utils/rating.ts

export function normalizeOptionalRating(rating: number | null | undefined): number | undefined {
  return rating ?? undefined
}
