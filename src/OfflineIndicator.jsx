import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowNotification(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!showNotification && isOnline) return null

    return (
        <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
            <div className="offline-content">
                {isOnline ? (
                    <>
                        <Wifi size={20} />
                        <span>已恢復網路連線</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={20} />
                        <span>離線模式 - 部分功能可能受限</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default OfflineIndicator
