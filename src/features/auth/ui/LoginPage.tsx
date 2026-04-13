import { useEffect, useRef } from 'react'
import { Button, Form, Input, Typography } from 'antd'

import { useAuthContext } from '../state/useAuthContext'

interface LoginFormValues {
  email: string
  password: string
}

const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function useMatrixRain(canvasRef: React.RefObject<HTMLCanvasElement | null>): void {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fontSize = 14
    let animationId: number
    let columns: number[]

    function resize(): void {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const colCount = Math.floor(canvas.width / fontSize)
      columns = Array.from({ length: colCount }, () => Math.floor(Math.random() * -100))
    }

    function draw(): void {
      if (!canvas || !ctx) return

      ctx.fillStyle = 'rgba(5, 15, 5, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#39ff14'
      ctx.font = `${fontSize}px 'Courier New', monospace`

      for (let i = 0; i < columns.length; i++) {
        const y = (columns[i] ?? 0) * fontSize
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] ?? '0'

        // Leading char is bright neon, rest fades
        ctx.fillStyle = '#39ff14'
        ctx.shadowColor = '#39ff14'
        ctx.shadowBlur = 8
        ctx.fillText(char, i * fontSize, y)

        ctx.shadowBlur = 0

        const col = columns[i] ?? 0
        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = 0
        } else {
          columns[i] = col + 1
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef])
}

export function LoginPage() {
  const { state, login } = useAuthContext()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useMatrixRain(canvasRef)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#050f05',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Courier New', Consolas, monospace",
      }}
    >
      {/* Rain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Login card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(5, 15, 5, 0.85)',
          border: '1px solid #39ff14',
          borderRadius: 6,
          padding: '32px 36px',
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 0 24px #39ff1440, 0 0 60px #39ff1415',
          backdropFilter: 'blur(4px)',
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
