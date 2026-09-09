import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Playlist, Track } from '../types'
import { DEMO_TRACKS, DEMO_PLAYLISTS } from '../lib/mockData'
import TrackRow from '../components/ui/TrackRow'
import PlaylistCard from '../components/ui/PlaylistCard'
import CreatePlaylistModal from '../components/modals/CreatePlaylistModal'
import UploadModal from '../components/modals/UploadModal'

type Tab = 'playlists' | 'liked' | 'uploads'

export default function Library() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('playlists')

  const [playlists, setPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS)
  const [likedTracks, setLikedTracks] = useState<Track[]>([DEMO_TRACKS[0], DEMO_TRACKS[1], DEMO_TRACKS[3]])
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([DEMO_TRACKS[0], DEMO_TRACKS[2]])
  const [loading, setLoading] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchLibraryData = async () => {
    if (!user || !isSupabaseConfigured) return

    setLoading(true)
    try {
      // 1. Fetch User Playlists
      const { data: plData } = await supabase
        .from('playlists')
        .select('*, playlist_tracks(count)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (plData && plData.length > 0) {
        setPlaylists(
          plData.map((p: any) => ({
            ...p,
            track_count: p.playlist_tracks?.[0]?.count ?? 0,
          }))
        )
      }

      // 2. Fetch Liked Songs
      const { data: likedData } = await supabase
        .from('liked_tracks')
        .select('*, track:tracks(*)')
        .eq('user_id', user.id)
        .order('liked_at', { ascending: false })

      if (likedData && likedData.length > 0) {
        const tracks = likedData
          .map((r: any) => r.track)
          .filter(Boolean) as Track[]
        setLikedTracks(tracks)
      }

      // 3. Fetch Uploads
      const { data: uploadsData } = await supabase
        .from('tracks')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (uploadsData && uploadsData.length > 0) {
        setUploadedTracks(uploadsData as Track[])
      }
    } catch (err) {
      console.warn('Error fetching library data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLibraryData()
  }, [user?.id])

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-16 animate-fade-in">
      {/* Library Title & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-col pb-5">
        <div>
          <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.6px]">
            Your Library
          </h1>
          <p className="text-[13px] text-text-muted mt-1">
            Playlists, favorite anthems, and uploaded original tracks
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-surface p-1.5 rounded-[10px] border border-border-col self-start shadow-inner">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-1.5 rounded-[7px] text-[13px] font-medium transition-all ${
              activeTab === 'playlists'
                ? 'bg-accent text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-1.5 rounded-[7px] text-[13px] font-medium transition-all ${
              activeTab === 'liked'
                ? 'bg-accent text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Liked songs ({likedTracks.length})
          </button>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-1.5 rounded-[7px] text-[13px] font-medium transition-all ${
              activeTab === 'uploads'
                ? 'bg-accent text-white shadow'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Uploads ({uploadedTracks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-[8px] bg-surface/60 animate-pulse border border-border-col/50"
            />
          ))}
        </div>
      ) : (
        <>
          {/* 1. Playlists Tab */}
          {activeTab === 'playlists' && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-text-muted">
                  Showing {playlists.length} playlists
                </span>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-[8px] bg-accent text-white text-[13px] font-medium hover:brightness-110 active:scale-98 transition flex items-center gap-1.5 shadow-lg shadow-accent/25"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  New Playlist
                </button>
              </div>

              {playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {playlists.map((pl) => (
                    <PlaylistCard key={pl.id} playlist={pl} />
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-[12px] bg-surface border border-border-col text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-text-muted">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    No playlists yet
                  </h3>
                  <p className="text-[13px] text-text-muted max-w-sm">
                    Create your first playlist to organize your favorite songs and share them.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 px-5 py-2 rounded-full bg-accent text-white text-[13px] font-medium hover:brightness-110 transition"
                  >
                    Create a playlist
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Liked Songs Tab */}
          {activeTab === 'liked' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-text-muted">
                  {likedTracks.length} saved songs
                </span>
              </div>

              {likedTracks.length > 0 ? (
                <div className="flex flex-col divide-y divide-border-col/40 bg-surface/30 rounded-[10px] border border-border-col/60 p-1">
                  {likedTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      queue={likedTracks}
                      isLiked={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-[12px] bg-surface border border-border-col text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-accent">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    Songs you like will appear here
                  </h3>
                  <p className="text-[13px] text-text-muted max-w-sm">
                    Save tracks you love by clicking the heart icon on any song.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Uploads Tab */}
          {activeTab === 'uploads' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-text-muted">
                  {uploadedTracks.length} uploaded songs
                </span>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 rounded-[8px] bg-accent text-white text-[13px] font-medium hover:brightness-110 active:scale-98 transition flex items-center gap-1.5 shadow-lg shadow-accent/25"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  Upload New Song
                </button>
              </div>

              {uploadedTracks.length > 0 ? (
                <div className="flex flex-col divide-y divide-border-col/40 bg-surface/30 rounded-[10px] border border-border-col/60 p-1">
                  {uploadedTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={index}
                      queue={uploadedTracks}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-[12px] bg-surface border border-border-col text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-text-muted">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-primary">
                    No tracks yet
                  </h3>
                  <p className="text-[13px] text-text-muted max-w-sm">
                    Upload your first track to start streaming and building your personal library.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-2 px-5 py-2 rounded-full bg-accent text-white text-[13px] font-medium hover:brightness-110 transition"
                  >
                    Upload your first track
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchLibraryData}
        />
      )}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchLibraryData}
        />
      )}
    </div>
  )
}
