import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommandPaletteProvider, useCommandPalette } from '../state/CommandPaletteContext'
import { ThemeProvider } from '../state/ThemeContext'
import { CommandPalette } from './CommandPalette'

// AntD's Modal close animation never completes in jsdom (no real CSS
// transitions), so it can't be closed by checking DOM removal. This probe
// reads the open flag straight from context instead.
function OpenStateProbe() {
  const { open } = useCommandPalette()
  return <span data-testid="palette-open-state">{String(open)}</span>
}

function renderPalette() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <CommandPaletteProvider>
          <CommandPalette />
          <OpenStateProbe />
        </CommandPaletteProvider>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
  )
  window.localStorage.clear()
})

describe('CommandPalette', () => {
  it('is closed until Ctrl+K is pressed', () => {
    renderPalette()
    expect(screen.queryByPlaceholderText('Buscar juegos o comandos…')).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByPlaceholderText('Buscar juegos o comandos…')).toBeInTheDocument()
  })

  it('closes after selecting a navigation action', () => {
    renderPalette()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByTestId('palette-open-state')).toHaveTextContent('true')

    fireEvent.click(screen.getByText('Ir a Inicio'))

    expect(screen.getByTestId('palette-open-state')).toHaveTextContent('false')
  })

  it('opens with Cmd+K (metaKey) too', () => {
    renderPalette()

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(screen.getByPlaceholderText('Buscar juegos o comandos…')).toBeInTheDocument()
  })

  it('filters static actions by typed text', () => {
    renderPalette()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

    const input = screen.getByPlaceholderText('Buscar juegos o comandos…')
    fireEvent.change(input, { target: { value: 'colec' } })

    expect(screen.getByText('Ir a Mi Colección')).toBeInTheDocument()
    expect(screen.queryByText('Ir a Crear Juego')).not.toBeInTheDocument()
  })

  it('toggling the theme action does not close the palette', () => {
    renderPalette()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

    const input = screen.getByPlaceholderText('Buscar juegos o comandos…')
    fireEvent.change(input, { target: { value: 'modo' } })

    const themeOption = screen.getByText(/Cambiar a modo/)
    fireEvent.click(themeOption)

    expect(screen.getByTestId('palette-open-state')).toHaveTextContent('true')
  })
})
