export function normalizeOptionalRating(rating: number | null | undefined): number | undefined {
  return rating ?? undefined
}
