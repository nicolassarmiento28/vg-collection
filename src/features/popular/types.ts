export interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number // Unix timestamp in seconds
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
  total_rating_count?: number
  // Extended fields used by GameDetailPage
  summary?: string
  genres?: Array<{ name: string }>
  involved_companies?: Array<{ company: { name: string }; developer: boolean }>
}
