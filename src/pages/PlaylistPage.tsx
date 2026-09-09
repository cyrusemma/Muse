import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { usePlayerStore } from '../store/playerStore'
import { formatDuration, trackColor, trackColorDark } from '../lib/utils'
import { DEMO_PLAYLISTS, DEMO_TRACKS } from '../lib/mockData'
import type { Playlist, Track } from '../types'
import TrackRow from '../components/ui/TrackRow'

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { play, isPlaying, currentTrack, pause, resume } = usePlayerStore()

  // Find demo playlist if matching
  const initialDemoPlaylist = DEMO_PLAYLISTS.find((p) => p.id === id) || DEMO_PLAYLISTS[0]
  const [playlist, setPlaylist] = useState<Playlist | null>(initialDemoPlaylist)
  const [ownerUsername, setOwnerUsername] = useState<string>('Muse')
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS.slice(0, 6))
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['demo-1', 'demo-3']))
  const [loading, setLoading] = useState(false)

  // Track addition state for owner
  const [showAddTracks, setShowAddTracks] = useState(false)
  const [availableTracks, setAvailableTracks] = useState<Track[]>(DEMO_TRACKS)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPlaylistData = async () => {
    if (!id || !isSupabaseConfigured) return

    setLoading(true)
    try {
      // 1. Fetch Playlist Details
      const { data: plData, error: plError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single()

      if (!plError && plData) {
        setPlaylist(plData)

        // 2. Fetch Owner Profile
        if (plData.owner_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', plData.owner_id)
            .single()
          if (profileData) {
            setOwnerUsername(profileData.display_name || profileData.username)
          }
        }

        // 3. Fetch Playlist Tracks
        const { data: ptData, error: ptError } = await supabase
          .from('playlist_tracks')
          .select('*, track:tracks(*)')
          .eq('playlist_id', id)
          .order('position')

        if (!ptError && ptData && ptData.length > 0) {
          const trackList = ptData
            .map((p: any) => p.track)
            .filter(Boolean) as Track[]
          setTracks(trackList)
        }
      }

      // 4. Fetch User Likes
      if (user) {
        const { data: likesData } = await supabase
          .from('liked_tracks')
          .select('track_id')
          .eq('user_id', user.id)

        if (likesData) {
          setLikedTrackIds(new Set(likesData.map((l: any) => l.track_id)))
        }
      }
    } catch (err) {
      console.warn('Error loading playlist from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const demo = DEMO_PLAYLISTS.find((p) => p.id === id)
    if (demo) {
      setPlaylist(demo)
      setTracks(DEMO_TRACKS.slice(0, demo.track_count || 6))
    }
    fetchPlaylistData()
  }, [id, user?.id])

  const handleOpenAddTracks = async () => {
    setShowAddTracks(true)
    if (!isSupabaseConfigured) {
      setAvailableTracks(DEMO_TRACKS)
      return
    }
    try {
      const { data } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)
      if (data && data.length > 0) {
        setAvailableTracks(data)
      } else {
        setAvailableTracks(DEMO_TRACKS)
      }
    } catch (e) {
      console.warn('Error fetching available tracks:', e)
    }
  }

  const handleAddTrackToPlaylist = async (track: Track) => {
    if (!id) return
    const nextPosition = tracks.length
    setTracks([...tracks, track])

    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('playlist_tracks').insert({
          playlist_id: id,
          track_id: track.id,
          position: nextPosition,
        })
      } catch (err) {
        console.warn('Error adding track to playlist in DB:', err)
      }
    }
  }

  const isOwner = (user && playlist && user.id === playlist.owner_id) || !isSupabaseConfigured
  const totalDuration = tracks.reduce(
    (sum, t) => sum + (t.duration_seconds || 0),
    0
  )

  const isCurrentPlaylistPlaying =
    tracks.some((t) => t.id === currentTrack?.id) && isPlaying

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isCurrentPlaylistPlaying) {
      pause()
    } else if (tracks.some((t) => t.id === currentTrack?.id)) {
      resume()
    } else {
      play(tracks[0], tracks)
    }
  }

  if (!playlist && !loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Playlist Not Found
        </h2>
        <p className="text-[13px] text-text-muted">
          The playlist you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="mt-2 px-5 py-2 rounded-full bg-accent text-white text-[13px] font-medium"
        >
          Return Home
        </Link>
      </div>
    )
  }

  const currentPl = playlist || initialDemoPlaylist

  const bgGradient = `linear-gradient(135deg, ${trackColor(
    currentPl.id
  )}, ${trackColorDark(currentPl.id)})`

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-16 animate-fade-in">
      {/* 1. Hero Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-7 pb-6 border-b border-border-col">
        {/* Cover Art */}
        <div className="w-48 h-48 shrink-0 rounded-[12px] overflow-hidden shadow-2xl border border-border-col">
          {currentPl.cover_url ? (
            <img
              src={currentPl.cover_url}
              alt={currentPl.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white/50"
              style={{ background: bgGradient }}
            >
              <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
            </div>
          )}
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col gap-2 min-w-0 flex-1 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/15 px-2.5 py-0.5 rounded-full self-center sm:self-start border border-accent/20">
            Playlist
          </span>
          <h1 className="text-[30px] md:text-[36px] font-bold text-text-primary tracking-[-0.6px] truncate leading-tight">
            {currentPl.name}
          </h1>
          {currentPl.description && (
            <p className="text-[14px] text-text-muted max-w-xl">
              {currentPl.description}
            </p>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[13px] text-text-muted mt-1">
            <span className="text-text-primary font-medium">
              {ownerUsername || 'Muse Curator'}
            </span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatDuration(totalDuration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="px-7 py-3 rounded-full bg-accent text-white text-[14px] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent/30 disabled:opacity-50"
        >
          {isCurrentPlaylistPlaying ? (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All
            </>
          )}
        </button>

        {isOwner && (
          <button
            onClick={handleOpenAddTracks}
            className="px-5 py-2.5 rounded-full bg-surface2 border border-border-col text-text-primary text-[13px] font-medium hover:bg-[#2A2A2A] transition"
          >
            + Add songs
          </button>
        )}
      </div>

      {/* 3. Track List */}
      <div className="flex flex-col gap-2">
        {tracks.length > 0 ? (
          <div className="flex flex-col divide-y divide-border-col/40 bg-surface/30 rounded-[10px] border border-border-col/60 p-1">
            {tracks.map((track, index) => (
              <TrackRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                queue={tracks}
                isLiked={likedTrackIds.has(track.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-[12px] bg-surface border border-border-col text-center flex flex-col items-center gap-2">
            <p className="text-[14px] font-medium text-text-primary">
              This playlist is empty
            </p>
            <p className="text-[12px] text-text-muted">
              Add some songs to start listening to your custom mix.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Add Songs to Playlist */}
      {showAddTracks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-[550px] bg-surface border border-border-col rounded-[14px] p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-col">
              <h3 className="text-[17px] font-semibold text-text-primary">
                Add Songs to {currentPl.name}
              </h3>
              <button
                onClick={() => setShowAddTracks(false)}
                className="text-text-muted hover:text-text-primary text-[18px]"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search available songs..."
              className="w-full px-3.5 py-2.5 bg-surface2 border border-border-col rounded-[8px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none"
            />

            <div className="flex flex-col gap-1 overflow-y-auto pr-1 divide-y divide-border-col/30 flex-1">
              {availableTracks
                .filter(
                  (t) =>
                    !searchQuery ||
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((track) => {
                  const alreadyInPlaylist = tracks.some((t) => t.id === track.id)
                  return (
                    <div
                      key={track.id}
                      className="flex items-center justify-between py-2 px-1"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-text-primary truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddTrackToPlaylist(track)}
                        disabled={alreadyInPlaylist}
                        className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-medium transition ${
                          alreadyInPlaylist
                            ? 'bg-surface2 text-text-dim cursor-default'
                            : 'bg-accent text-white hover:brightness-110 shadow'
                        }`}
                      >
                        {alreadyInPlaylist ? 'Added' : 'Add'}
                      </button>
                    </div>
                  )
                })}
            </div>

            <div className="flex justify-end pt-3 border-t border-border-col">
              <button
                onClick={() => setShowAddTracks(false)}
                className="px-5 py-2 rounded-[8px] bg-accent text-white text-[13px] font-medium shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
