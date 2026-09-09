import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Track } from '../types'
import TrackRow from '../components/ui/TrackRow'
import { useAuth } from '../context/AuthContext'
import { DEMO_TRACKS } from '../lib/mockData'

const GENRES = [
  { id: 'g1', name: 'Afrobeats', colorA: '#7C5CFC', colorB: '#3B8BD4', query: 'Burna' },
  { id: 'g2', name: 'Amapiano', colorA: '#F2A623', colorB: '#E8583C', query: 'Asake' },
  { id: 'g3', name: 'R&B / Soul', colorA: '#E8583C', colorB: '#7a1a0a', query: 'Tems' },
  { id: 'g4', name: 'Pop & Vibes', colorA: '#D4537E', colorB: '#4a0a28', query: 'Water' },
  { id: 'g5', name: 'Afrorave', colorA: '#1D9E75', colorB: '#04342C', query: 'Rema' },
  { id: 'g6', name: 'Highlife', colorA: '#3B8BD4', colorB: '#042C53', query: 'Essence' },
  { id: 'g7', name: 'Dancehall', colorA: '#1D9E75', colorB: '#F2A623', query: 'Ayra' },
  { id: 'g8', name: 'Party Mix', colorA: '#7C5CFC', colorB: '#D4537E', query: 'Davido' },
]

export default function Search() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(['demo-1']))
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch liked tracks for user
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    supabase
      .from('liked_tracks')
      .select('track_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((d: any) => d.track_id)))
      })
  }, [user?.id])

  // 300ms Debounced search effect
  useEffect(() => {
    const trimmed = searchTerm.trim().toLowerCase()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    const timer = setTimeout(async () => {
      if (!isSupabaseConfigured) {
        // Filter demo tracks locally
        const matches = DEMO_TRACKS.filter(
          (t) =>
            t.title.toLowerCase().includes(trimmed) ||
            t.artist.toLowerCase().includes(trimmed) ||
            (t.album && t.album.toLowerCase().includes(trimmed))
        )
        setResults(matches)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .or(
            `title.ilike.%${trimmed}%,artist.ilike.%${trimmed}%,album.ilike.%${trimmed}%`
          )
          .limit(20)

        if (!error && data && data.length > 0) {
          setResults(data)
        } else {
          // Fallback to local search if remote returned empty
          const matches = DEMO_TRACKS.filter(
            (t) =>
              t.title.toLowerCase().includes(trimmed) ||
              t.artist.toLowerCase().includes(trimmed) ||
              (t.album && t.album.toLowerCase().includes(trimmed))
          )
          setResults(matches)
        }
      } catch (err) {
        console.warn('Search failed:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleGenreClick = (query: string) => {
    setSearchTerm(query)
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-16 animate-fade-in">
      {/* Search Input Bar */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] font-semibold text-text-primary tracking-[-0.5px]">
          Search
        </h1>
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs, artists, or albums..."
            className="w-full pl-10 pr-10 py-3 bg-surface border border-border-col rounded-[10px] text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors shadow-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results or Genre Browsing */}
      {hasSearched ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-text-primary">
              {loading
                ? 'Searching songs...'
                : `Found ${results.length} ${results.length === 1 ? 'song' : 'songs'} for "${searchTerm}"`}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-[6px] bg-surface/60 animate-pulse border border-border-col/30"
                />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col divide-y divide-border-col/40 bg-surface/30 rounded-[10px] border border-border-col/60 p-1">
              {results.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  queue={results}
                  isLiked={likedIds.has(track.id)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-[12px] bg-surface border border-border-col text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-text-muted mb-1">
                🔍
              </div>
              <p className="text-[15px] font-semibold text-text-primary">
                No songs found for "{searchTerm}"
              </p>
              <p className="text-[12px] text-text-muted max-w-sm">
                Check your spelling or try searching for a different artist or song title.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-[18px] font-semibold text-text-primary tracking-[-0.3px]">
            Explore by Genre & Mood
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((g) => (
              <div
                key={g.id}
                onClick={() => handleGenreClick(g.query)}
                className="group relative h-32 rounded-[12px] p-4 cursor-pointer overflow-hidden shadow-lg hover:scale-[1.03] active:scale-98 transition-all flex items-end border border-white/5"
                style={{
                  background: `linear-gradient(135deg, ${g.colorA}, ${g.colorB})`,
                }}
              >
                <div className="absolute top-3 right-3 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all">
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <span className="text-[17px] font-bold text-white tracking-tight drop-shadow-md">
                  {g.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
