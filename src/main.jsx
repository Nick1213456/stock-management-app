import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// 註冊 Service Worker 並處理更新
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('有新版本可用！點擊確定以更新應用程式。')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('應用程式已準備好離線使用')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

