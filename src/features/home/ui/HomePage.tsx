// src/features/home/ui/HomePage.tsx
import { PopularGamesSection } from '../../popular/ui/PopularGamesSection'

export function HomePage() {
  return (
    <>
      <PopularGamesSection title="MEJOR VALORADOS" layout="carousel" hook="popular" />
      <PopularGamesSection title="LANZAMIENTOS RECIENTES" layout="grid" hook="recent" />
    </>
  )
}
