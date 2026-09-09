import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import PlaylistPage from './pages/PlaylistPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-text-muted text-[13px]">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main app shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/playlist/:id" element={<PlaylistPage />} />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
