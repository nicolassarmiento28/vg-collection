import { SearchOutlined } from '@ant-design/icons'
import { Input, Modal } from 'antd'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIgdbSearch } from '../../features/popular/hooks/useIgdbSearch'
import { useCommandPalette } from '../state/CommandPaletteContext'
import { useTheme } from '../state/ThemeContext'

interface PaletteItem {
  id: string
  label: string
  closesPalette: boolean
  run: () => void
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const { results } = useIgdbSearch(query)

  useEffect(() => {
    function handleGlobalShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [setOpen])

  function close() {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }

  function goTo(path: string) {
    navigate(path)
    close()
  }

  const staticActions: PaletteItem[] = useMemo(
    () => [
      { id: 'nav-home', label: 'Ir a Inicio', closesPalette: true, run: () => goTo('/') },
      { id: 'nav-coleccion', label: 'Ir a Mi Colección', closesPalette: true, run: () => goTo('/coleccion') },
      { id: 'nav-crear', label: 'Ir a Crear Juego', closesPalette: true, run: () => goTo('/crear') },
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        closesPalette: false,
        run: toggleTheme,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  )

  const q = query.trim().toLowerCase()
  const filteredActions = staticActions.filter(
    (action) => q.length === 0 || action.label.toLowerCase().includes(q),
  )

  const gameItems: PaletteItem[] = results.map((game) => ({
    id: `game-${game.id}`,
    label: game.name,
    closesPalette: true,
    run: () => goTo(`/juego/${game.id}`),
  }))

  const items = [...filteredActions, ...gameItems]

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[activeIndex]?.run()
    }
  }

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      centered
      destroyOnHidden
      width={480}
      styles={{
        container: {
          background: 'var(--bg-surface)',
          borderTop: '4px solid var(--accent)',
          borderRadius: 8,
        },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      <Input
        autoFocus
        placeholder="Buscar juegos o comandos…"
        aria-label="Command palette"
        prefix={<SearchOutlined aria-hidden="true" style={{ color: 'var(--text-muted)' }} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          marginBottom: 12,
        }}
      />

      <div role="listbox" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {items.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '12px 4px' }}>
            Sin resultados
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={item.id}
            role="option"
            aria-selected={index === activeIndex}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={item.run}
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              color: index === activeIndex ? 'var(--text-h)' : 'var(--text)',
              background: index === activeIndex ? 'var(--accent-dim)' : 'transparent',
              fontSize: 14,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </Modal>
  )
}
