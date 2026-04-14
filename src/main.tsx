import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './shared/state/ThemeContext.tsx'

function ThemedConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme: appTheme } = useTheme()

  const isDark = appTheme === 'dark'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark
          ? {
              colorPrimary: '#e03c2f',
              colorBgContainer: '#1a1918',
              colorBgElevated: '#242220',
              colorBorder: '#2e2b28',
              colorText: '#c9c2b8',
              colorTextHeading: '#f5f0ea',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: 6,
              colorLink: '#e03c2f',
            }
          : {
              colorPrimary: '#e03c2f',
              colorBgContainer: '#ffffff',
              colorBgElevated: '#eae6e1',
              colorBorder: '#d4cfc9',
              colorText: '#3a3530',
              colorTextHeading: '#1a1714',
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: 6,
              colorLink: '#e03c2f',
            },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedConfigProvider>
        <App />
      </ThemedConfigProvider>
    </ThemeProvider>
  </StrictMode>,
)
