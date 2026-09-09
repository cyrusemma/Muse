import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: authErr } = await signIn(email.trim(), password)
      if (authErr) setError(authErr.message || 'Invalid email or password.')
      else navigate('/')
    } catch (err: any) {
      setError(err?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0F0F' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[380px] animate-fade-in">
        {/* Card */}
        <div
          className="flex flex-col p-10 shadow-2xl"
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/40" />
            <span className="text-[26px] font-bold tracking-tight text-white">Muse</span>
          </div>

          <h1 className="text-[20px] font-semibold text-center text-text-primary mb-1">Welcome back</h1>
          <p className="text-[13px] text-text-muted text-center mb-7">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-[8px] bg-red-950/50 border border-red-800/50 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-[8px] text-[14px] text-text-primary placeholder:text-text-dim"
                style={{ background: '#222', border: '1px solid #2A2A2A' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-[8px] text-[14px] text-text-primary placeholder:text-text-dim"
                style={{ background: '#222', border: '1px solid #2A2A2A' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-[8px] bg-accent text-white text-[14px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-muted">
            No account?{' '}
            <Link to="/signup" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
