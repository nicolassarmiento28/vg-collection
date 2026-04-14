import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'

import type { Game, GameStatus, Platform } from '../../../shared/types/game'

const statusOptions: Array<{ label: string; value: GameStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

interface GameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
  igdbId?: number
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
}

export function GameFormModal({ open, mode, game, prefill, onCancel, onSubmit }: GameFormModalProps) {
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
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
        <Form.Item
          label="Titulo"
          name="title"
          rules={[{ required: true, message: 'El titulo es obligatorio' }]}
        >
          <Input aria-label="Titulo" placeholder="Ej. The Legend of Zelda" />
        </Form.Item>

        <Form.Item
          label="Plataforma"
          name="platform"
          rules={[{ required: true, message: 'La plataforma es obligatoria' }]}
        >
          <Select aria-label="Plataforma">
            <Select.OptGroup label="Sega">
              <Select.Option value="sega-ms">Master System</Select.Option>
              <Select.Option value="sega-md">Mega Drive</Select.Option>
              <Select.Option value="sega-saturn">Saturn</Select.Option>
              <Select.Option value="sega-dc">Dreamcast</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Nintendo">
              <Select.Option value="nes">NES</Select.Option>
              <Select.Option value="snes">SNES</Select.Option>
              <Select.Option value="n64">Nintendo 64</Select.Option>
              <Select.Option value="gamecube">GameCube</Select.Option>
              <Select.Option value="wii">Wii</Select.Option>
              <Select.Option value="wiiu">Wii U</Select.Option>
              <Select.Option value="switch">Nintendo Switch</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Portátiles Nintendo">
              <Select.Option value="gameboy">Game Boy</Select.Option>
              <Select.Option value="gbc">Game Boy Color</Select.Option>
              <Select.Option value="gba">Game Boy Advance</Select.Option>
              <Select.Option value="nds">Nintendo DS</Select.Option>
              <Select.Option value="3ds">Nintendo 3DS</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="PlayStation">
              <Select.Option value="ps1">PlayStation 1</Select.Option>
              <Select.Option value="ps2">PlayStation 2</Select.Option>
              <Select.Option value="ps3">PlayStation 3</Select.Option>
              <Select.Option value="ps4">PlayStation 4</Select.Option>
              <Select.Option value="ps5">PlayStation 5</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Portátiles Sony">
              <Select.Option value="psp">PSP</Select.Option>
              <Select.Option value="psvita">PS Vita</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Microsoft">
              <Select.Option value="xbox">Xbox</Select.Option>
              <Select.Option value="xbox360">Xbox 360</Select.Option>
              <Select.Option value="xbone">Xbox One</Select.Option>
              <Select.Option value="xbsx">Xbox Series X/S</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="PC">
              <Select.Option value="pc">PC</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Commodore">
              <Select.Option value="c64">Commodore 64</Select.Option>
              <Select.Option value="amiga">Amiga</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Otra">
              <Select.Option value="other">Otra</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>

        <Form.Item
          label="Estado"
          name="status"
          rules={[{ required: true, message: 'El estado es obligatorio' }]}
        >
          <Select aria-label="Estado" options={statusOptions} />
        </Form.Item>

        <Form.Item
          label="Genero"
          name="genre"
          rules={[{ required: true, message: 'El genero es obligatorio' }]}
        >
          <Input aria-label="Genero" placeholder="Ej. RPG" />
        </Form.Item>

        <Form.Item
          label="Anio"
          name="year"
          rules={[
            { required: true, message: 'El anio es obligatorio' },
            { type: 'number', min: 1970, max: 2100, message: 'El anio debe estar entre 1970 y 2100' },
          ]}
        >
          <InputNumber aria-label="Anio" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Nota" name="rating">
          <InputNumber min={0} max={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Notas" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Hidden field — carries igdbId from prefill so it gets submitted */}
        <Form.Item name="igdbId" hidden>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
