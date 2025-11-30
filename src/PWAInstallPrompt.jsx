import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            // 防止瀏覽器預設的安裝提示
            e.preventDefault()
            // 儲存事件以便稍後觸發
            setDeferredPrompt(e)
            // 顯示自訂安裝提示
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        // 顯示安裝提示
        deferredPrompt.prompt()

        // 等待用戶回應
        const { outcome } = await deferredPrompt.userChoice

        console.log(`用戶選擇: ${outcome}`)

        // 清除 deferredPrompt
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // 24小時後再次顯示
        setTimeout(() => {
            setShowPrompt(true)
        }, 24 * 60 * 60 * 1000)
    }

    if (!showPrompt) return null

    return (
        <div className="pwa-install-prompt">
            <div className="pwa-install-content">
                <div className="pwa-install-icon">
                    <Download size={24} />
                </div>
                <div className="pwa-install-text">
                    <h3>安裝應用程式</h3>
                    <p>將庫存系統安裝到主畫面，隨時快速存取</p>
                </div>
                <div className="pwa-install-actions">
                    <button className="btn btn-primary" onClick={handleInstall}>
                        安裝
                    </button>
                    <button className="btn-icon" onClick={handleDismiss}>
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PWAInstallPrompt
