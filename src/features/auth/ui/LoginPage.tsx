import { useEffect } from 'react'
import { Button, Form, Input, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

import { useAuthContext } from '../state/useAuthContext'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { state, login } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (state.session.isAuthenticated) {
      navigate('/')
    }
  }, [state.session.isAuthenticated, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#050f05',
        fontFamily: "'Courier New', Consolas, monospace",
      }}
    >
      <div
        style={{
          background: 'rgba(5, 15, 5, 0.85)',
          border: '1px solid #39ff14',
          borderRadius: 6,
          padding: '32px 36px',
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 0 24px #39ff1440, 0 0 60px #39ff1415',
        }}
      >
        <div
          style={{
            color: '#39ff14',
            fontSize: 16,
            fontWeight: 'bold',
            letterSpacing: 3,
            textAlign: 'center',
            textShadow: '0 0 10px #39ff14',
            marginBottom: 24,
            fontFamily: "'Courier New', Consolas, monospace",
          }}
        >
          INICIAR SESION
        </div>

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={(values) => void login(values.email, values.password)}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email valido' },
            ]}
          >
            <Input aria-label="Email" />
          </Form.Item>

          <Form.Item
            label="Contrasena"
            name="password"
            rules={[
              { required: true, message: 'La contrasena es obligatoria' },
              { min: 8, message: 'La contrasena debe tener al menos 8 caracteres' },
              {
                validator: (_, value: string | undefined) => {
                  if (!value) return Promise.resolve()
                  const hasLetter = /[A-Za-z]/.test(value)
                  const hasNumber = /\d/.test(value)
                  return hasLetter && hasNumber
                    ? Promise.resolve()
                    : Promise.reject(new Error('La contrasena debe incluir letras y numeros'))
                },
              },
            ]}
          >
            <Input.Password aria-label="Contrasena" />
          </Form.Item>

          {state.error !== undefined && (
            <Typography.Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
              {state.error}
            </Typography.Text>
          )}

          <Button block type="primary" htmlType="submit" loading={state.isSubmitting}>
            Iniciar sesion
          </Button>
        </Form>
      </div>
    </div>
  )
}
