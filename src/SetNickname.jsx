import { useState } from 'react'
import { supabase } from './supabaseClient'
import { User } from 'lucide-react'

export default function SetNickname({ onComplete, initialNickname = '', onCancel }) {
    const [nickname, setNickname] = useState(initialNickname)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!nickname.trim()) {
            alert('請輸入暱稱')
            return
        }

        if (nickname.trim().length < 2) {
            alert('暱稱至少需要 2 個字元')
            return
        }

        try {
            setLoading(true)

            // 更新使用者的 metadata
            const { error } = await supabase.auth.updateUser({
                data: { nickname: nickname.trim() }
            })

            if (error) throw error

            alert('✓ 暱稱設定成功！')
            onComplete()
        } catch (error) {
            console.error('Error setting nickname:', error)
            alert('✗ 設定暱稱失敗: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="nickname-container" style={onCancel ? { position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 } : {}}>
            <div className="nickname-card">
                <div className="nickname-header">
                    <div className="logo-circle">
                        <User size={32} color="white" />
                    </div>
                    <h1>{initialNickname ? '修改暱稱' : '設定您的暱稱'}</h1>
                    <p>請設定一個暱稱，這將顯示在修改紀錄中</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>暱稱</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="請輸入您的暱稱"
                            maxLength={20}
                            autoFocus
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            2-20 個字元
                        </small>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {onCancel && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancel}
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                取消
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ marginRight: '8px' }}></div>
                                    處理中...
                                </>
                            ) : (
                                '確認'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
