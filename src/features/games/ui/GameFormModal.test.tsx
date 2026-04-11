import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { GameFormModal } from './GameFormModal'

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver
}

function getErrorText(content: string, element: Element | null) {
  const hasText = (node: Element | null) => node?.textContent === content
  const nodeHasText = hasText(element)
  const childrenDontHaveText = Array.from(element?.children ?? []).every(
    (child) => !hasText(child),
  )

  return nodeHasText && childrenDontHaveText
}

describe('GameFormModal', () => {
  it('shows required validations and blocks submit for empty form', async () => {
    const onSubmit = vi.fn()

    render(
      <GameFormModal
        open
        mode="create"
        onCancel={() => {}}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Crear' }))

    expect(await screen.findByText((_, e) => getErrorText('El titulo es obligatorio', e))).toBeInTheDocument()
    expect(await screen.findByText((_, e) => getErrorText('La plataforma es obligatoria', e))).toBeInTheDocument()
    expect(await screen.findByText((_, e) => getErrorText('El estado es obligatorio', e))).toBeInTheDocument()
    expect(await screen.findByText((_, e) => getErrorText('El genero es obligatorio', e))).toBeInTheDocument()
    expect(await screen.findByText((_, e) => getErrorText('El anio es obligatorio', e))).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits successfully when required fields are completed', async () => {
    const onSubmit = vi.fn()

    render(
      <GameFormModal
        open
        mode="edit"
        game={{
          id: 'game-1',
          title: 'Existing game',
          platform: 'pc',
          status: 'backlog',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }}
        onCancel={() => {}}
        onSubmit={onSubmit}
      />,
    )

    await userEvent.clear(screen.getByLabelText('Titulo'))
    await userEvent.type(screen.getByLabelText('Titulo'), 'Hollow Knight')
    await userEvent.type(screen.getByLabelText('Genero'), 'Metroidvania')
    await userEvent.type(screen.getByLabelText('Anio'), '2017')

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const submittedValues = onSubmit.mock.calls[0][0] as Record<string, unknown>
    expect(submittedValues).toMatchObject({
      title: 'Hollow Knight',
      platform: 'pc',
      status: 'backlog',
      genre: 'Metroidvania',
      year: 2017,
    })

    const modal = screen.getByRole('dialog')
    expect(within(modal).queryByText('El titulo es obligatorio')).not.toBeInTheDocument()
  })
})
