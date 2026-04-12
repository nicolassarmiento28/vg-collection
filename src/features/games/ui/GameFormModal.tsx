import { Alert, Button, Form, Input, InputNumber, Modal, Select, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { searchIgdbGames, type IgdbGameDto } from '../api/igdbApi'
import type { Game, GameStatus, Platform } from '../../../shared/types/game'

const platformOptions: Array<{ label: string; value: Platform }> = [
  { label: 'PC', value: 'pc' },
  { label: 'PlayStation', value: 'playstation' },
  { label: 'Xbox', value: 'xbox' },
  { label: 'Switch', value: 'switch' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Otra', value: 'other' },
]

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
}

interface GameFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  game?: Game
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

export function GameFormModal({ open, mode, game, onCancel, onSubmit }: GameFormModalProps) {
  const [form] = Form.useForm<GameFormValues>()
  const [isSearchingIgdb, setIsSearchingIgdb] = useState(false)
  const [igdbError, setIgdbError] = useState<string | null>(null)
  const [lastSearchTerm, setLastSearchTerm] = useState('')
  const [igdbSearchResults, setIgdbSearchResults] = useState<IgdbGameDto[]>([])

  const handleSearchIgdb = async (rawValue: string) => {
    const query = rawValue.trim()

    if (query.length === 0) {
      setIgdbError(null)
      setIgdbSearchResults([])
      return
    }

    setIsSearchingIgdb(true)
    setIgdbError(null)
    setLastSearchTerm(query)

    try {
      const results = await searchIgdbGames(query)
      setIgdbSearchResults(results)
    } catch {
      setIgdbSearchResults([])
      setIgdbError('No se pudo buscar en IGDB. Puedes reintentar o completar manualmente.')
    } finally {
      setIsSearchingIgdb(false)
    }
  }

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
    setIgdbError(null)
    setLastSearchTerm('')
    setIgdbSearchResults([])
  }, [form, game, mode, open])

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
        <Form.Item label="Buscar en IGDB" name="igdbSearch">
          <Input.Search
            aria-label="Buscar en IGDB"
            placeholder="Ej. Zelda"
            enterButton="Buscar"
            loading={isSearchingIgdb}
            onSearch={handleSearchIgdb}
          />
        </Form.Item>

        {igdbError !== null && (
          <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 12 }}>
            <Alert type="error" message={igdbError} showIcon />
            <Button onClick={() => void handleSearchIgdb(lastSearchTerm)}>Reintentar</Button>
          </Space>
        )}

        {!isSearchingIgdb && igdbError === null && lastSearchTerm.length > 0 && igdbSearchResults.length === 0 && (
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            Sin resultados en IGDB. Puedes completar los campos manualmente.
          </Typography.Text>
        )}

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
          <Select aria-label="Plataforma" options={platformOptions} />
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
      </Form>
    </Modal>
  )
}

export type { GameFormValues }
