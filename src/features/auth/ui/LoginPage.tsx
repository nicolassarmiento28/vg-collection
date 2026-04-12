import { Button, Card, Form, Input, Typography } from 'antd'

import { useAuthContext } from '../state/useAuthContext'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { state, login } = useAuthContext()

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Card title="Iniciar sesion" style={{ width: 420, maxWidth: '100%' }}>
        <Form<LoginFormValues> layout="vertical" onFinish={(values) => void login(values.email, values.password)}>
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
                  if (!value) {
                    return Promise.resolve()
                  }

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
      </Card>
    </div>
  )
}
