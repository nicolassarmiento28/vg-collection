import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/state/AuthContext.tsx'
import { GamesProvider } from './features/games/state/GamesContext.tsx'
import { matrixTheme } from './theme/matrixTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={matrixTheme}>
      <AntdApp>
        <AuthProvider>
          <GamesProvider>
            <App />
          </GamesProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
