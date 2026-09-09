import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import PlaylistPage from './pages/PlaylistPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ color: '#888', padding: 40 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      {!isSupabaseConfigured && (
        <div style={{ background: '#fffbf0', color: '#7a4a00', padding: '8px 12px', textAlign: 'center' }}>
          Supabase is not configured. Fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your .env
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  )
}
