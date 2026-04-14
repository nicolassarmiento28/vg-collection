import { Alert, App as AntdApp, Button, Form, Input, Modal, Typography } from 'antd'
import { useState } from 'react'
import { useAuthContext } from '../state/AuthContext'

type ModalView = 'login' | 'register'

interface LoginFormValues {
  email: string
  password: string
}

interface RegisterFormValues {
  username: string
  email: string
  password: string
}

export function LoginModal() {
  const { state, dispatch } = useAuthContext()
  const { message } = AntdApp.useApp()
  const [view, setView] = useState<ModalView>('login')
  const [loginForm] = Form.useForm<LoginFormValues>()
  const [registerForm] = Form.useForm<RegisterFormValues>()

  function handleClose() {
    dispatch({ type: 'closeModal' })
    setView('login')
    loginForm.resetFields()
    registerForm.resetFields()
  }

  function handleLoginSubmit(values: LoginFormValues) {
    dispatch({ type: 'login', payload: { email: values.email } })
    setView('login')
    void message.success('¡Bienvenido!')
  }

  function handleRegisterSubmit(values: RegisterFormValues) {
    dispatch({ type: 'login', payload: { email: values.email } })
    setView('login')
    void message.success('¡Bienvenido!')
  }

  return (
    <Modal
      open={state.isModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={420}
      destroyOnHidden
      styles={{
        container: {
          background: 'var(--bg-surface)',
          borderTop: '4px solid var(--accent)',
          borderRadius: 8,
          padding: '32px 36px',
        },
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Typography.Title
          level={3}
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-h)',
            letterSpacing: 2,
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--accent)', marginRight: 6 }}>▸</span>
          VG COLLECTION
        </Typography.Title>
      </div>

      {view === 'login' ? (
        <>
          <Alert
            type="info"
            showIcon={false}
            style={{
              marginBottom: 20,
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              borderLeft: '4px solid var(--accent)',
              borderRadius: 4,
              padding: '10px 14px',
            }}
            message={
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 4 }}>
                  Usuario demo
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Email: <span style={{ color: 'var(--text)' }}>demo@vgcollection.app</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  Contraseña: <span style={{ color: 'var(--text)' }}>demo1234</span>
                </div>
              </div>
            }
          />
          <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'El email es obligatorio' },
                { type: 'email', message: 'Ingresa un email válido' },
              ]}
            >
              <Input placeholder="tu@email.com" />
            </Form.Item>

            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: 'La contraseña es obligatoria' }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" block>
                Iniciar sesión
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Typography.Text style={{ color: 'var(--text)', fontSize: 13 }}>
                ¿No tienes cuenta?{' '}
                <Typography.Link
                  onClick={() => setView('register')}
                  style={{ color: 'var(--accent)' }}
                >
                  Regístrate
                </Typography.Link>
              </Typography.Text>
            </div>
          </Form>
        </>
      ) : (
        <Form form={registerForm} layout="vertical" onFinish={handleRegisterSubmit}>
          <Form.Item
            label="Nombre de usuario"
            name="username"
            rules={[{ required: true, message: 'El nombre de usuario es obligatorio' }]}
          >
            <Input placeholder="GamerXYZ" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'El email es obligatorio' },
              { type: 'email', message: 'Ingresa un email válido' },
            ]}
          >
            <Input placeholder="tu@email.com" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'La contraseña es obligatoria' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block>
              Crear cuenta
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text style={{ color: 'var(--text)', fontSize: 13 }}>
              ¿Ya tienes cuenta?{' '}
              <Typography.Link
                onClick={() => setView('login')}
                style={{ color: 'var(--accent)' }}
              >
                Inicia sesión
              </Typography.Link>
            </Typography.Text>
          </div>
        </Form>
      )}
    </Modal>
  )
}
