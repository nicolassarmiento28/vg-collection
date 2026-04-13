import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../api/igdbApi', () => ({
  searchIgdbGames: vi.fn(),
}))

import { searchIgdbGames } from '../api/igdbApi'
import { SearchPage } from './SearchPage'

const mockSearchIgdbGames = vi.mocked(searchIgdbGames)

function renderSearchPage() {
  return render(
    <MemoryRouter>
      <SearchPage />
    </MemoryRouter>,
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the search input', () => {
    renderSearchPage()
    expect(screen.getByPlaceholderText('Buscar juego en IGDB...')).toBeInTheDocument()
  })

  it('calls searchIgdbGames and shows results when user submits', async () => {
    const user = userEvent.setup()

    mockSearchIgdbGames.mockResolvedValue([
      { id: 1, name: 'The Witcher 3', slug: 'the-witcher-3' },
      { id: 2, name: 'Elden Ring', slug: 'elden-ring' },
    ])

    renderSearchPage()

    await user.type(screen.getByPlaceholderText('Buscar juego en IGDB...'), 'witcher')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(screen.getByLabelText('The Witcher 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Elden Ring')).toBeInTheDocument()
    })

    expect(mockSearchIgdbGames).toHaveBeenCalledWith('witcher')
  })

  it('shows empty state when no results returned', async () => {
    const user = userEvent.setup()

    mockSearchIgdbGames.mockResolvedValue([])

    renderSearchPage()

    await user.type(screen.getByPlaceholderText('Buscar juego en IGDB...'), 'xyznotfound')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(
        screen.getByText('No se encontraron resultados para «xyznotfound»'),
      ).toBeInTheDocument()
    })
  })

  it('shows error message when API call fails', async () => {
    const user = userEvent.setup()

    mockSearchIgdbGames.mockRejectedValue(new Error('Network error'))

    renderSearchPage()

    await user.type(screen.getByPlaceholderText('Buscar juego en IGDB...'), 'error')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => {
      expect(screen.getByText('Error al buscar juegos. Intenta de nuevo.')).toBeInTheDocument()
    })
  })

  it('triggers search on Enter key press', async () => {
    const user = userEvent.setup()

    mockSearchIgdbGames.mockResolvedValue([{ id: 99, name: 'Doom', slug: 'doom' }])

    renderSearchPage()

    await user.type(screen.getByPlaceholderText('Buscar juego en IGDB...'), 'doom{Enter}')

    await waitFor(() => {
      expect(screen.getByLabelText('Doom')).toBeInTheDocument()
    })
  })
})
