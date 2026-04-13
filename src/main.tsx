import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/state/AuthContext.tsx'
import { GamesProvider } from './features/games/state/GamesContext.tsx'

const matrixTheme = {
  token: {
    colorPrimary: '#39ff14',
    colorSuccess: '#22cc00',
    colorWarning: '#996600',
    colorError: '#cc2200',
    colorInfo: '#39ff14',
    colorText: '#22cc00',
    colorTextSecondary: '#1a9900',
    colorTextTertiary: '#1a9900',
    colorTextQuaternary: '#0d6600',
    colorBgBase: '#050f05',
    colorBgContainer: '#0a1f0a',
    colorBgElevated: '#0a1f0a',
    colorBgLayout: '#050f05',
    colorBgSpotlight: '#0a1f0a',
    colorBorder: '#1a4a1a',
    colorBorderSecondary: '#0f2a0f',
    colorFill: '#0a1f0a',
    colorFillSecondary: '#051005',
    colorFillTertiary: '#030a03',
    colorFillQuaternary: '#020702',
    colorSplit: '#1a4a1a',
    fontFamily: "'Courier New', Consolas, monospace",
    fontSize: 13,
    borderRadius: 3,
    lineWidth: 1,
    controlHeight: 32,
  },
  components: {
    Table: {
      headerBg: '#0a1f0a',
      headerColor: '#39ff14',
      headerSplitColor: '#1a4a1a',
      rowHoverBg: '#0f2a0f',
      borderColor: '#1a4a1a',
      bodySortBg: '#0a1f0a',
    },
    Button: {
      primaryColor: '#000000',
      defaultBorderColor: '#1a4a1a',
      defaultColor: '#22cc00',
      defaultBg: '#050f05',
    },
    Input: {
      colorBgContainer: '#000000',
      activeShadow: '0 0 8px #39ff1440',
      hoverBorderColor: '#39ff14',
      activeBorderColor: '#39ff14',
    },
    Select: {
      colorBgContainer: '#000000',
      optionSelectedBg: '#0a1f0a',
      optionActiveBg: '#0f2a0f',
    },
    Modal: {
      contentBg: '#0a1f0a',
      headerBg: '#0a1f0a',
      titleColor: '#39ff14',
      titleFontSize: 13,
    },
    Card: {
      colorBgContainer: '#0a1f0a',
      colorBorderSecondary: '#1a4a1a',
    },
    Form: {
      labelColor: '#22cc00',
    },
    Alert: {
      colorText: '#22cc00',
    },
    Tag: {
      defaultBg: '#050f05',
      defaultColor: '#22cc00',
    },
    InputNumber: {
      colorBgContainer: '#000000',
      activeShadow: '0 0 8px #39ff1440',
      hoverBorderColor: '#39ff14',
      activeBorderColor: '#39ff14',
    },
    Spin: {
      colorPrimary: '#39ff14',
    },
    Pagination: {
      itemActiveBg: '#0a1f0a',
    },
  },
}

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
