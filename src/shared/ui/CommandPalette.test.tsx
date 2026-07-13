import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommandPaletteProvider } from '../state/CommandPaletteProvider'
import { ThemeProvider } from '../state/ThemeContext'
import { CommandPalette } from './CommandPalette'

function renderPalette() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <CommandPaletteProvider>
          <CommandPalette />
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
    expect(screen.getByPlaceholderText('Buscar juegos o comandos…')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Ir a Inicio'))

    expect(screen.queryByPlaceholderText('Buscar juegos o comandos…')).not.toBeInTheDocument()
  })

  it('closes on Escape', () => {
    renderPalette()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    const input = screen.getByPlaceholderText('Buscar juegos o comandos…')

    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', keyCode: 27, which: 27 })

    expect(screen.queryByPlaceholderText('Buscar juegos o comandos…')).not.toBeInTheDocument()
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

    expect(screen.getByPlaceholderText('Buscar juegos o comandos…')).toBeInTheDocument()
  })
})
