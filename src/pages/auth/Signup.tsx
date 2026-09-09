import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: authErr } = await signUp(email.trim(), password, username.trim())
      if (authErr) {
        setError(authErr.message || 'Registration failed.')
      } else {
        setSuccess(true)
        setTimeout(() => navigate('/'), 2000)
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0F0F' }}>
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 fill-accent" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-white mb-1">Account created!</h2>
          <p className="text-text-muted text-[13px]">Redirecting you now…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0F0F' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[380px] animate-fade-in">
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

          <h1 className="text-[20px] font-semibold text-center text-text-primary mb-1">Create your account</h1>
          <p className="text-[13px] text-text-muted text-center mb-7">Free forever — your music, your way</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-[8px] bg-red-950/50 border border-red-800/50 text-[13px] text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">Username</label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_name"
                className="w-full px-4 py-2.5 rounded-[8px] text-[14px] text-text-primary placeholder:text-text-dim"
                style={{ background: '#222', border: '1px solid #2A2A2A' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">Email address</label>
              <input
                type="email"
                required
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min. 6 characters"
                className="w-full px-4 py-2.5 rounded-[8px] text-[14px] text-text-primary placeholder:text-text-dim"
                style={{ background: '#222', border: '1px solid #2A2A2A' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-[8px] bg-accent text-white text-[14px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-accent/20 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Get started'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
