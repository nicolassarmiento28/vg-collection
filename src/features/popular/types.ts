export interface IgdbGame {
  id: number
  name: string
  cover: { url: string }
  first_release_date?: number // Unix timestamp in seconds
  platforms?: Array<{ abbreviation: string }>
  total_rating?: number
}
