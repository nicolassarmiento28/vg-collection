import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'
import { useState } from 'react'
import { useGamesContext } from '../../features/games/state/GamesContext'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'
import type { IgdbGame } from '../../features/popular/types'
import type { GameFormPrefill, Platform } from '../types/game'

// Maps IGDB platform abbreviations to local Platform enum
const IGDB_PLATFORM_MAP: Record<string, Platform> = {
  PC: 'pc',
  PS1: 'playstation',
  PS2: 'playstation',
  PS3: 'playstation',
  PS4: 'playstation',
  PS5: 'playstation',
  XB: 'xbox',
  X360: 'xbox',
  XONE: 'xbox',
  XSX: 'xbox',
  NS: 'switch',
  iOS: 'mobile',
  Android: 'mobile',
}

function mapIgdbToFormPrefill(game: IgdbGame): Partial<GameFormPrefill> {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : undefined

  const platform: Platform =
    game.platforms
      ?.map((p) => IGDB_PLATFORM_MAP[p.abbreviation])
      .find((p) => p !== undefined) ?? 'other'

  return {
    title: game.name,
    ...(year !== undefined ? { year } : {}),
    platform,
  }
}

function getCoverUrl(game: IgdbGame): string | undefined {
  if (!game.cover?.url) return undefined
  // IGDB returns protocol-relative URLs like //images.igdb.com/...
  const url = game.cover.url.startsWith('//')
    ? `https:${game.cover.url}`
    : game.cover.url
  // Replace thumbnail size with small cover
  return url.replace('t_thumb', 't_cover_small')
}

export function HeaderSearch() {
  const [inputValue, setInputValue] = useState('')
  const { results, loading } = useIgdbSearch(inputValue)
  const { dispatch } = useGamesContext()

  const options = results.map((game) => {
    const coverUrl = getCoverUrl(game)
    const year = game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null

    return {
      value: String(game.id),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={game.name}
              style={{
                width: 32,
                height: 32,
                objectFit: 'cover',
                borderRadius: 4,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: 'var(--bg-elevated)',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 13 }}>
              {game.name}
            </div>
            {year && (
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{year}</div>
            )}
          </div>
        </div>
      ),
    }
  })

  // Add "sin resultados" entry when query is long enough but empty results returned
  const noResultsOption =
    inputValue.trim().length >= 2 && !loading && results.length === 0
      ? [
          {
            value: '__no_results__',
            label: <span style={{ color: 'var(--text-muted)' }}>Sin resultados</span>,
            disabled: true,
          },
        ]
      : []

  function handleSelect(value: string) {
    if (value === '__no_results__') return
    const game = results.find((g) => String(g.id) === value)
    if (!game) return
    const prefill = mapIgdbToFormPrefill(game)
    dispatch({ type: 'openCreateModal', payload: prefill })
    setInputValue('')
  }

  return (
    <AutoComplete
      value={inputValue}
      options={[...options, ...noResultsOption]}
      onSelect={handleSelect}
      onSearch={setInputValue}
      style={{ width: 380 }}
      popupMatchSelectWidth={380}
    >
      <Input
        placeholder="Buscar juegos, géneros, plataformas…"
        suffix={
          loading ? (
            <LoadingOutlined style={{ color: 'var(--accent)' }} />
          ) : (
            <SearchOutlined style={{ color: 'var(--text-muted)' }} />
          )
        }
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          borderRadius: 24,
        }}
      />
    </AutoComplete>
  )
}
