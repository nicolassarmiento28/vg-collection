import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../api/igdbApi', () => ({
  fetchIgdbGameById: vi.fn(),
}))

vi.mock('../state/useGamesContext', () => ({
  useGamesContext: vi.fn(),
}))

import { fetchIgdbGameById } from '../api/igdbApi'
import { useGamesContext } from '../state/useGamesContext'
import type { Game } from '../../../shared/types/game'
import { GameDetailPage } from './GameDetailPage'

const mockFetch = vi.mocked(fetchIgdbGameById)
const mockUseGamesContext = vi.mocked(useGamesContext)

const mockDispatch = vi.fn()

function renderGameDetail(igdbId: string, games: Game[] = []) {
  mockUseGamesContext.mockReturnValue({
    state: {
      games,
      search: '',
      platformFamilyFilter: 'all',
      platformFilter: 'all',
      statusFilter: 'all',
    },
    dispatch: mockDispatch,
  })

  return render(
    <MemoryRouter initialEntries={[`/game/${igdbId}`]}>
      <ConfigProvider>
        <AntdApp>
          <Routes>
            <Route path="/game/:igdbId" element={<GameDetailPage />} />
            <Route path="/" element={<div>Collection</div>} />
          </Routes>
        </AntdApp>
      </ConfigProvider>
    </MemoryRouter>,
  )
}

describe('GameDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while fetching', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderGameDetail('1')
    expect(document.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('shows game info after fetch resolves', async () => {
    mockFetch.mockResolvedValue({
      id: 1,
      name: 'The Witcher 3',
      slug: 'the-witcher-3',
      summary: 'An open world RPG.',
      firstReleaseDate: '2015-05-19',
      genres: ['RPG'],
      platforms: ['pc'],
    })

    renderGameDetail('1')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'The Witcher 3' })).toBeInTheDocument()
    })

    expect(screen.getByText('An open world RPG.')).toBeInTheDocument()
  })

  it('shows "Agregar a mi coleccion" button when game not in collection', async () => {
    mockFetch.mockResolvedValue({ id: 1, name: 'Doom', slug: 'doom' })

    renderGameDetail('1', [])

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Agregar a mi coleccion' }),
      ).toBeInTheDocument()
    })
  })

  it('shows disabled "Ya en tu coleccion" button when game already in collection', async () => {
    mockFetch.mockResolvedValue({ id: 1, name: 'Doom', slug: 'doom' })

    const existingGame: Game = {
      id: 'uuid-1',
      title: 'Doom',
      platform: 'pc',
      status: 'completed',
      genre: 'FPS',
      year: 1993,
      createdAt: '',
      updatedAt: '',
      igdb: { id: 1, slug: 'doom' },
    }

    renderGameDetail('1', [existingGame])

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Ya en tu coleccion' })
      expect(btn).toBeInTheDocument()
      expect(btn).toBeDisabled()
    })
  })

  it('opens the add modal on button click', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({ id: 1, name: 'Doom', slug: 'doom' })

    renderGameDetail('1', [])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Agregar a mi coleccion' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Agregar a mi coleccion' }))

    await waitFor(() => {
      expect(screen.getByText('Agregar a coleccion')).toBeInTheDocument()
    })
  })

  it('shows error when igdbId is not a valid number', () => {
    mockFetch.mockResolvedValue({ id: 0, name: 'x', slug: 'x' })
    renderGameDetail('not-a-number')
    expect(screen.getByText('Juego no encontrado')).toBeInTheDocument()
  })

  it('shows error + Volver button when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Not found'))

    renderGameDetail('999')

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el juego.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument()
    })
  })
})
