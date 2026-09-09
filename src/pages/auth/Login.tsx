import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signIn(email, password)
    if (error) setError(error.message ?? String(error))
    else nav('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F0F' }}>
      <form onSubmit={submit} style={{ background: 'var(--surface)', padding: 40, borderRadius: 12, width: 380, border: '1px solid var(--border)' }}>
        <h2 style={{ marginBottom: 12 }}>Log in</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        {error && <div style={{ color: 'salmon', marginBottom: 8 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 12, background: 'var(--accent)', color: '#000', borderRadius: 8 }}>Sign in</button>
        <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--muted)' }}>No account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign up</Link></div>
      </form>
    </div>
  )
}
