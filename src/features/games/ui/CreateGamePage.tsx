// src/features/games/ui/CreateGamePage.tsx
import { LockOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Form, Grid, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAuthContext } from '../../auth/state/AuthContext'
import { useGamesContext } from '../state/GamesContext'
import { GameFormFields } from './GameFormFields'
import { type GameFormValues } from './GameFormModal'
import { normalizeOptionalRating } from '../../../shared/utils/rating'

const initialValues: Partial<GameFormValues> = {
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
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm<GameFormValues>()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false

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
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
        }}
      >
        <LockOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />
        <Typography.Text style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Inicia sesión para crear juegos en tu colección
        </Typography.Text>
        <Button type="primary" onClick={() => authDispatch({ type: 'openModal' })}>
          Iniciar sesión
        </Button>
      </div>
    )
  }

  function handleFinish(values: GameFormValues) {
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
        rating: normalizeOptionalRating(values.rating),
        notes: values.notes,
        coverUrl: values.coverUrl,
        coverBase64: values.coverBase64,
        pros: values.pros,
        cons: values.cons,
        createdAt: now,
        updatedAt: now,
      },
    })
    void message.success('Juego creado correctamente')
    navigate('/coleccion')
  }

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 560, width: '100%' }}>
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
        <GameFormFields form={form} />

        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" style={{ width: '100%' }}>
            Guardar juego
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
