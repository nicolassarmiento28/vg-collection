// src/shared/ui/AppFooter.tsx
import { Layout } from 'antd'

const { Footer } = Layout

export function AppFooter() {
  return (
    <Footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 12,
        padding: '16px 24px',
      }}
    >
      © 2026 Nicolás Sarmiento. Todos los derechos reservados.
    </Footer>
  )
}
