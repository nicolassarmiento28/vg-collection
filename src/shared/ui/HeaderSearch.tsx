// src/shared/ui/HeaderSearch.tsx
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Input } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IgdbGame } from '../../features/popular/types'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'

function getCoverUrl(game: IgdbGame): string | undefined {
  if (!game.cover?.url) return undefined
  const url = game.cover.url.startsWith('//')
    ? `https:${game.cover.url}`
    : game.cover.url
  return url.replace('t_thumb', 't_cover_small')
}

export function HeaderSearch() {
  const [inputValue, setInputValue] = useState('')
  const { results, loading } = useIgdbSearch(inputValue)
  const navigate = useNavigate()

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
    <AutoComplete
      value={inputValue}
      options={[...options, ...noResultsOption]}
      onSelect={handleSelect}
      onSearch={setInputValue}
      style={{ width: '100%', maxWidth: 380 }}
      popupMatchSelectWidth={380}
    >
      <Input
        placeholder="Buscar juegos, géneros, plataformas…"
        suffix={
          loading
            ? <LoadingOutlined style={{ color: 'var(--accent)' }} />
            : <SearchOutlined style={{ color: 'var(--text-muted)' }} />
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
