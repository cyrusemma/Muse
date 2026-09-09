import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { Playlist } from '../../types'
import { trackColor, trackColorDark } from '../../lib/utils'
import { DEMO_PLAYLISTS } from '../../lib/mockData'
import UploadModal from '../modals/UploadModal'
import CreatePlaylistModal from '../modals/CreatePlaylistModal'

const HARDCODED_ARTISTS = [
  { name: 'Burna Boy', genre: 'Afrobeats', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { name: 'Tems', genre: 'R&B / Soul', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { name: 'Asake', genre: 'Amapiano', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { name: 'Wizkid', genre: 'Afrobeats', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { name: 'Rema', genre: 'Afrorave', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80' },
]

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS)
  const [showUpload, setShowUpload] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const fetchUserPlaylists = async () => {
    if (!user || !isSupabaseConfigured) return

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(count)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const formatted: Playlist[] = data.map((pl: any) => ({
          ...pl,
          track_count: pl.playlist_tracks?.[0]?.count ?? 0,
        }))
        setPlaylists(formatted)
      }
    } catch (err) {
      console.warn('Sidebar fetch playlists error:', err)
    }
  }

  useEffect(() => {
    fetchUserPlaylists()
  }, [user?.id])

  return (
    <>
      <aside
        style={{
          background: '#1A1A1A',
          borderRight: '1px solid #2A2A2A',
          gridColumn: 1,
          gridRow: 1,
          height: '100%',
          width: '220px',
        }}
        className="flex flex-col justify-between p-4 overflow-y-auto select-none"
      >
        <div className="flex flex-col gap-5">
          {/* 1. App Logo: Muse with small violet circle dot before it */}
          <Link to="/" className="flex items-center gap-2 px-2 pt-1 group">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block shadow-sm shadow-accent/50 group-hover:scale-125 transition-transform" />
            <span className="text-[20px] font-bold text-text-primary tracking-tight">
              Muse
            </span>
          </Link>

          {/* 2. Main Navigation Links */}
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(124,92,252,0.15)] text-accent font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface2'
                }`
              }
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Home
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(124,92,252,0.15)] text-accent font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface2'
                }`
              }
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              Search
            </NavLink>

            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(124,92,252,0.15)] text-accent font-semibold'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface2'
                }`
              }
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
              </svg>
              Your Library
            </NavLink>
          </nav>

          {/* Quick Actions: Upload & Create Playlist */}
          <div className="flex gap-2 px-1">
            <button
              onClick={() => {
                if (!user && isSupabaseConfigured) navigate('/login')
                else setShowUpload(true)
              }}
              className="flex-1 py-1.5 px-2.5 rounded-[6px] bg-accent text-white text-[12px] font-semibold hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-md shadow-accent/25"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
              </svg>
              Upload
            </button>
            <button
              onClick={() => {
                if (!user && isSupabaseConfigured) navigate('/login')
                else setShowCreate(true)
              }}
              className="py-1.5 px-2.5 rounded-[6px] bg-surface2 border border-border-col text-text-primary text-[12px] font-medium hover:bg-[#2A2A2A] active:scale-98 transition flex items-center justify-center"
              title="Create Playlist"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>

          <div className="h-px bg-border-col mx-1" />

          {/* 3. Your Playlists Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Playlists
              </span>
            </div>

            <div className="flex flex-col gap-1 max-h-[170px] overflow-y-auto pr-1">
              {playlists.map((pl) => (
                <NavLink
                  key={pl.id}
                  to={`/playlist/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-1.5 rounded-[6px] transition-colors ${
                      isActive
                        ? 'bg-surface2 text-accent'
                        : 'hover:bg-surface2/60 text-text-primary'
                    }`
                  }
                >
                  {pl.cover_url ? (
                    <img
                      src={pl.cover_url}
                      alt={pl.name}
                      className="w-8 h-8 rounded-[5px] object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-[5px] shrink-0 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${trackColor(
                          pl.id
                        )}, ${trackColorDark(pl.id)})`,
                      }}
                    >
                      ♫
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-normal truncate leading-tight">
                      {pl.name}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {pl.track_count ?? 0} tracks
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          {/* 4. Artists You Follow Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2">
              Artists you follow
            </span>
            <div className="flex flex-col gap-1.5 px-2">
              {HARDCODED_ARTISTS.map((artist) => (
                <div
                  key={artist.name}
                  className="flex items-center gap-2.5 py-1 text-text-primary hover:text-accent cursor-pointer transition-colors"
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-border-col"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-normal truncate leading-tight">
                      {artist.name}
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {artist.genre}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. User Profile Footer */}
        <div className="pt-3 border-t border-border-col mt-3">
          {user ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-semibold text-[13px] flex items-center justify-center border border-accent/40 shrink-0">
                  {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-text-primary truncate">
                    {profile?.display_name || profile?.username || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[11px] text-text-muted truncate">
                    @{profile?.username || 'user'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-2 rounded-[6px] bg-surface2 border border-border-col text-text-primary text-[13px] font-medium hover:bg-[#262626] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => {
            setShowUpload(false)
            fetchUserPlaylists()
          }}
        />
      )}
      {showCreate && (
        <CreatePlaylistModal
          onClose={() => {
            setShowCreate(false)
            fetchUserPlaylists()
          }}
        />
      )}
    </>
  )
}
