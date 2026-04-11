import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

async function renderModal(props: Parameters<typeof GameFormModal>[0]) {
  render(<GameFormModal {...props} />)
  return within(await screen.findByRole('dialog'))
}

describe('GameFormModal', () => {
  it('shows required validations and blocks submit for empty form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const modal = await renderModal({
      open: true,
      mode: 'create',
      onCancel: () => {},
      onSubmit,
    })

    await user.click(modal.getByRole('button', { name: 'Crear' }))

    expect(await modal.findByText((_, e) => getErrorText('El titulo es obligatorio', e))).toBeInTheDocument()
    expect(await modal.findByText((_, e) => getErrorText('La plataforma es obligatoria', e))).toBeInTheDocument()
    expect(await modal.findByText((_, e) => getErrorText('El estado es obligatorio', e))).toBeInTheDocument()
    expect(await modal.findByText((_, e) => getErrorText('El genero es obligatorio', e))).toBeInTheDocument()
    expect(await modal.findByText((_, e) => getErrorText('El anio es obligatorio', e))).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('blocks submit when year is outside accepted range', async () => {
    const onSubmit = vi.fn()

    const modal = await renderModal({
      open: true,
      mode: 'edit',
      game: {
        id: 'game-2',
        title: 'Existing game',
        platform: 'pc',
        status: 'backlog',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      onCancel: () => {},
      onSubmit,
    })

    fireEvent.change(modal.getByRole('textbox', { name: 'Genero' }), { target: { value: 'R' } })
    fireEvent.change(modal.getByRole('spinbutton', { name: 'Anio' }), { target: { value: '1969' } })

    fireEvent.click(modal.getByRole('button', { name: 'Guardar' }))

    expect(await modal.findByText((_, e) => getErrorText('El anio debe estar entre 1970 y 2100', e))).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits successfully when required fields are completed', async () => {
    const onSubmit = vi.fn()

    const modal = await renderModal({
      open: true,
      mode: 'edit',
      game: {
        id: 'game-1',
        title: 'Existing game',
        platform: 'pc',
        status: 'backlog',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      onCancel: () => {},
      onSubmit,
    })

    fireEvent.change(modal.getByRole('textbox', { name: 'Genero' }), { target: { value: 'M' } })
    fireEvent.change(modal.getByRole('spinbutton', { name: 'Anio' }), { target: { value: '2017' } })

    fireEvent.click(modal.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const submittedValues = onSubmit.mock.calls[0][0] as Record<string, unknown>
    expect(submittedValues).toMatchObject({
      title: 'Existing game',
      platform: 'pc',
      status: 'backlog',
      genre: 'M',
      year: 2017,
    })

    expect(modal.queryByText('El titulo es obligatorio')).not.toBeInTheDocument()
  })
})
