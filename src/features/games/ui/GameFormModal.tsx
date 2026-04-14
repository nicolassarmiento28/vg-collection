// src/features/games/ui/GameFormModal.tsx
import { Form, Grid, InputNumber, Modal } from 'antd'
import { useEffect } from 'react'

import type { Game, GameStatus, Platform } from '../../../shared/types/game'
import { GameFormFields } from './GameFormFields'

interface GameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdbId?: number
  coverUrl?: string
  coverBase64?: string
  pros?: string
  cons?: string
}

interface GameFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  game?: Game
  prefill?: Partial<GameFormValues>
  onCancel: () => void
  onSubmit: (values: GameFormValues) => void
}

const initialValues: Partial<GameFormValues> = {
  title: '',
  genre: '',
  year: undefined,
  rating: undefined,
  notes: '',
  coverUrl: undefined,
  coverBase64: undefined,
  pros: '',
  cons: '',
}

export function GameFormModal({ open, mode, game, prefill, onCancel, onSubmit }: GameFormModalProps) {
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const [form] = Form.useForm<GameFormValues>()

  useEffect(() => {
    if (!open) {
      return
    }

    form.resetFields()

    if (mode === 'edit' && game !== undefined) {
      form.setFieldsValue({
        title: game.title,
        platform: game.platform,
        status: game.status,
        genre: game.genre,
        year: game.year,
        rating: game.rating ?? undefined,
        notes: game.notes ?? '',
        igdbId: game.igdbId,
        coverUrl: game.coverUrl ?? undefined,
        coverBase64: game.coverBase64 ?? undefined,
        pros: game.pros ?? '',
        cons: game.cons ?? '',
      })
      return
    }

    form.setFieldsValue(initialValues)
    if (prefill !== undefined) {
      form.setFieldsValue(prefill)
    }
  }, [form, game, mode, open, prefill])

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Crear juego' : 'Editar juego'}
      okText={mode === 'create' ? 'Crear' : 'Guardar'}
      cancelText="Cancelar"
      onCancel={onCancel}
      onOk={() => {
        form.submit()
      }}
      destroyOnHidden
      width={isMobile ? '95vw' : 520}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
        <GameFormFields />

        {/* Hidden field — carries igdbId from prefill (create) or game (edit) so it gets submitted */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
        {/* coverBase64 is managed via form.setFieldValue in GameFormFields — no hidden element needed */}
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
