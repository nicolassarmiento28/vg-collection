// src/shared/ui/HeaderSearch.tsx
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Grid, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IgdbGame } from '../../features/popular/types'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'
import { useCommandPalette } from '../state/useCommandPalette'

const { useBreakpoint } = Grid

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const shortcutHint = isMac ? '⌘K' : 'Ctrl K'

function getCoverUrl(game: IgdbGame): string | undefined {
  if (!game.cover?.url) return undefined
  const url = game.cover.url.startsWith('//')
    ? `https:${game.cover.url}`
    : game.cover.url
  return url.replace('t_thumb', 't_cover_small')
}

export function HeaderSearch() {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const { results, loading } = useIgdbSearch(inputValue)
  const navigate = useNavigate()
  const { setOpen: setPaletteOpen } = useCommandPalette()
  const screens = useBreakpoint()
  const isMobile = screens.md === false
  // Enough room to embed the "Ctrl K" pill inside the input without
  // squeezing the placeholder; narrower desktop/tablet keeps it outside.
  const hasRoomForInlineHint = screens.lg === true

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
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
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
            <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: 13 }}>{game.name}</div>
            {year && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{year}</div>}
          </div>
        </div>
      ),
    }
  })

  const noResultsOption =
    inputValue.trim().length >= 2 && !loading && results.length === 0
      ? [{ value: '__no_results__', label: <span style={{ color: 'var(--text-muted)' }}>Sin resultados</span>, disabled: true }]
      : []

  function handleSelect(value: string) {
    if (value === '__no_results__') return
    setInputValue('')
    navigate(`/juego/${value}`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0, height: 40 }}>
      <AutoComplete
        value={inputValue}
        options={[...options, ...noResultsOption]}
        onSelect={handleSelect}
        onSearch={setInputValue}
        allowClear
        style={{ width: '100%', minWidth: 160, maxWidth: 480, position: 'relative' }}
        popupMatchSelectWidth={true}
      >
        <Input
          placeholder="Buscar juegos..."
          aria-label="Buscar juegos"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          suffix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading
                ? <LoadingOutlined aria-hidden="true" style={{ color: 'var(--accent)' }} />
                : <SearchOutlined aria-hidden="true" style={{ color: 'var(--text-muted)' }} />}
              {hasRoomForInlineHint && (
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Abrir command palette"
                  title="Abrir command palette"
                  style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '2px 7px',
                    cursor: 'pointer',
                  }}
                >
                  {shortcutHint}
                </button>
              )}
            </div>
          }
          style={{
            background: 'var(--bg-elevated)',
            borderColor: focused ? 'var(--accent)' : 'var(--border)',
            borderRadius: 24,
            padding: '8px 16px',
            height: 40,
            alignSelf: 'center',
            boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
            transition: 'border-color 150ms, box-shadow 150ms',
          }}
        />
      </AutoComplete>
      {!isMobile && !hasRoomForInlineHint && (
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Abrir command palette"
          title="Abrir command palette"
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
          }}
        >
          {shortcutHint}
        </button>
      )}
    </div>
  )
}
