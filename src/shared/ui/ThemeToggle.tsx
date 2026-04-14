// src/shared/ui/ThemeToggle.tsx
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { useTheme } from '../state/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 18,
        flexShrink: 0,
        borderRadius: 6,
        transition: 'color 150ms',
      }}
    >
      {isDark ? <SunOutlined /> : <MoonOutlined />}
    </button>
  )
}
