import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Profile, AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('muse_token')
    if (!token) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const data = await api.auth.me()
      if (data && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
        })
        setProfile({
          id: data.user.id,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
          bio: data.user.bio,
          created_at: data.user.created_at,
        })
      }
    } catch (err) {
      console.warn('Session check error:', err)
      localStorage.removeItem('muse_token')
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const refreshProfile = async () => {
    await checkAuth()
  }

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.auth.login({ email, password })
      if (data.token) {
        localStorage.setItem('muse_token', data.token)
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
        })
        setProfile({
          id: data.user.id,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
          bio: data.user.bio,
          created_at: data.user.created_at,
        })
        return { error: null }
      }
      return { error: new Error('Login failed') }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username: string, displayName?: string) => {
    try {
      const data = await api.auth.register({ email, password, username, displayName })
      if (data.token) {
        localStorage.setItem('muse_token', data.token)
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
        })
        setProfile({
          id: data.user.id,
          username: data.user.username,
          display_name: data.user.display_name,
          avatar_url: data.user.avatar_url,
          bio: data.user.bio,
          created_at: data.user.created_at,
        })
        return { error: null }
      }
      return { error: new Error('Sign up failed') }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('muse_token')
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
