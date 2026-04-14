// src/features/games/ui/CreateGamePage.tsx
import { LockOutlined } from '@ant-design/icons'
import { Button, Form, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAuthContext } from '../../auth/state/AuthContext'
import { useGamesContext } from '../state/GamesContext'
import { GameFormFields } from './GameFormFields'
import type { GameStatus, Platform } from '../../../shared/types/game'

interface CreateGameFormValues {
  title: string
  platform: Platform
  status: GameStatus
  genre: string
  year: number
  rating?: number
  notes?: string
}

const initialValues: Partial<CreateGameFormValues> = {
  title: '',
  genre: '',
  year: undefined,
  rating: undefined,
  notes: '',
}

export function CreateGamePage() {
  const { state: authState, dispatch: authDispatch } = useAuthContext()
  const { dispatch } = useGamesContext()
  const navigate = useNavigate()
  const [form] = Form.useForm<CreateGameFormValues>()

  if (!authState.isLoggedIn) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <LockOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para crear juegos en tu colección
        </div>
        <Button type="primary" onClick={() => authDispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    )
  }

  function handleFinish(values: CreateGameFormValues) {
    const now = new Date().toISOString()
    dispatch({
      type: 'addGame',
      payload: {
        id: uuidv4(),
        title: values.title,
        platform: values.platform,
        status: values.status,
        genre: values.genre,
        year: values.year,
        rating: values.rating,
        notes: values.notes,
        createdAt: now,
        updatedAt: now,
      },
    })
    navigate('/coleccion')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <Typography.Title
        level={2}
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-h)',
          letterSpacing: 1,
          marginBottom: 24,
        }}
      >
        Crear Juego
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <GameFormFields />

        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
            Guardar juego
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
