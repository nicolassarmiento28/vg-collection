import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/state/AuthContext.tsx'
import { GamesProvider } from './features/games/state/GamesContext.tsx'
import { matrixTheme } from './theme/matrixTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={matrixTheme}>
        <AntdApp>
          <AuthProvider>
            <GamesProvider>
              <App />
            </GamesProvider>
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
)
