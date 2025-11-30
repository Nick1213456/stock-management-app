import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Package } from 'lucide-react'

export default function Login() {
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (error) throw error
        } catch (error) {
            alert('登入失敗: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-circle">
                        <Package size={32} color="white" />
                    </div>
                    <h1>庫存管理系統</h1>
                    <p>請登入以繼續使用</p>
                </div>

                <button
                    className="google-btn"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="spinner-dark"></div>
                    ) : (
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google Logo"
                            className="google-icon"
                        />
                    )}
                    <span>使用 Google 帳號登入</span>
                </button>
            </div>
        </div>
    )
}
