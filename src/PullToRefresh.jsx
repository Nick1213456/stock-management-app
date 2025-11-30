import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

export default function PullToRefresh({ onRefresh, children }) {
    const [startY, setStartY] = useState(0)
    const [currentY, setCurrentY] = useState(0)
    const [refreshing, setRefreshing] = useState(false)
    const contentRef = useRef(null)

    // 閾值：下拉多少距離才觸發更新
    const PULL_THRESHOLD = 80
    // 最大下拉距離
    const MAX_PULL_DISTANCE = 120

    const handleTouchStart = (e) => {
        // 只有在頁面頂端時才觸發
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY)
        }
    }

    const handleTouchMove = (e) => {
        const touchY = e.touches[0].clientY
        const diff = touchY - startY

        // 只有在往下拉且在頂端時才處理
        if (window.scrollY === 0 && diff > 0) {
            // 增加阻力感，讓下拉不要太快
            const newY = diff * 0.4
            // 限制最大下拉距離
            setCurrentY(Math.min(newY, MAX_PULL_DISTANCE))

            // 阻止預設的滾動行為（如果需要的話，但在某些瀏覽器可能會影響體驗）
            // e.preventDefault() 
        }
    }

    const handleTouchEnd = async () => {
        if (currentY > PULL_THRESHOLD) {
            setRefreshing(true)
            setCurrentY(PULL_THRESHOLD) // 停留在閾值位置顯示轉圈

            try {
                await onRefresh()
            } finally {
                setRefreshing(false)
                setCurrentY(0)
            }
        } else {
            setCurrentY(0)
        }
        setStartY(0)
    }

    return (
        <div
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ minHeight: '100vh' }}
        >
            {/* 下拉指示器 */}
            <div
                style={{
                    height: currentY,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: refreshing ? 'height 0.2s' : 'height 0.2s, opacity 0.2s',
                    opacity: currentY > 0 ? 1 : 0,
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    transform: `rotate(${currentY * 2}deg)`,
                    transition: 'transform 0.2s'
                }}>
                    <RefreshCw size={20} className={refreshing ? 'spin-animation' : ''} />
                </div>
            </div>

            {/* 主要內容 */}
            <div style={{
                transform: `translateY(${0}px)`, // 可以選擇是否要讓內容跟著移動，這裡選擇不移動內容，只顯示上方指示器
                transition: 'transform 0.2s'
            }}>
                {children}
            </div>

            <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
