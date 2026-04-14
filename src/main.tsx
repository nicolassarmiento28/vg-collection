import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import './index.css'
import App from './App.tsx'
import { GamesProvider } from './features/games/state/GamesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#e03c2f',
          colorBgContainer: '#1a1918',
          colorBgElevated: '#242220',
          colorBorder: '#2e2b28',
          colorText: '#c9c2b8',
          colorTextHeading: '#f5f0ea',
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: 6,
          colorLink: '#e03c2f',
        },
      }}
    >
      <AntdApp>
        <GamesProvider>
          <App />
        </GamesProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
