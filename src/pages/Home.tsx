import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { usePlayerStore } from '../store/playerStore'
import { formatDuration } from '../lib/utils'
import { DEMO_TRACKS, DEMO_PLAYLISTS } from '../lib/mockData'
import type { Track, Playlist } from '../types'
import TrackRow from '../components/ui/TrackRow'
import TrackCard from '../components/ui/TrackCard'
import PlaylistCard from '../components/ui/PlaylistCard'
import CoverArt from '../components/ui/CoverArt'

export default function Home() {
  const { user } = useAuth()
  const { play, currentTrack, isPlaying, pause, resume } = usePlayerStore()

  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(DEMO_TRACKS[0])
  const [trendingTracks, setTrendingTracks] = useState<Track[]>(DEMO_TRACKS)
  const [recentTracks, setRecentTracks] = useState<Track[]>(DEMO_TRACKS.slice(0, 5))
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS)
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['demo-1', 'demo-3']))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadHomeData() {
      if (!isSupabaseConfigured) return

      try {
        setLoading(true)
        // 1. Fetch Trending Tracks
        const { data: trendingData, error } = await supabase
          .from('tracks')
          .select('*')
          .order('play_count', { ascending: false })
          .limit(10)

        if (!error && trendingData && trendingData.length > 0 && isMounted) {
          setTrendingTracks(trendingData as Track[])
          setFeaturedTrack(trendingData[0] as Track)
        }

        // 2. Fetch User Specific Data
        if (user) {
          const { data: likesData } = await supabase
            .from('liked_tracks')
            .select('track_id')
            .eq('user_id', user.id)

          if (likesData && isMounted) {
            setLikedTrackIds(new Set(likesData.map((l: any) => l.track_id)))
          }

          const { data: historyData } = await supabase
            .from('play_history')
            .select('*, track:tracks(*)')
            .eq('user_id', user.id)
            .order('played_at', { ascending: false })
            .limit(10)

          if (historyData && isMounted && historyData.length > 0) {
            const seen = new Set<string>()
            const recents: Track[] = []
            for (const h of historyData) {
              if (h.track && !seen.has(h.track.id)) {
                seen.add(h.track.id)
                recents.push(h.track)
              }
            }
            if (recents.length > 0) {
              setRecentTracks(recents)
              setFeaturedTrack(recents[0])
            }
          }

          const { data: playlistData } = await supabase
            .from('playlists')
            .select('*, playlist_tracks(count)')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

          if (playlistData && playlistData.length > 0 && isMounted) {
            setUserPlaylists(
              playlistData.map((pl: any) => ({
                ...pl,
                track_count: pl.playlist_tracks?.[0]?.count ?? 0,
              }))
            )
          }
        }
      } catch (err) {
        console.warn('Supabase fetch home data error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadHomeData()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const isHeroCurrent = currentTrack?.id === featuredTrack?.id
  const isHeroPlaying = isHeroCurrent && isPlaying

  const handleHeroPlay = () => {
    if (!featuredTrack) return
    if (isHeroCurrent) {
      if (isPlaying) pause()
      else resume()
    } else {
      play(featuredTrack, trendingTracks)
    }
  }

  return (
    <div className="flex flex-col gap-9 max-w-6xl pb-16 animate-fade-in">
      {/* 1. Featured Hero Banner */}
      {featuredTrack && (
        <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#1A1A1A] via-[#1E192B] to-[#120f1e] border border-[#2A2A2A] p-6 md:p-8 flex flex-col md:flex-row items-center gap-7 shadow-2xl group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative shrink-0">
            <CoverArt
              src={featuredTrack.cover_url}
              trackId={featuredTrack.id}
              size={180}
              borderRadius={10}
              className="shadow-2xl shadow-black/80"
            />
            {isHeroPlaying && (
              <div className="absolute bottom-3 left-3 flex items-end gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                <span className="w-1 bg-accent rounded-full eq-bar-1" />
                <span className="w-1 bg-accent rounded-full eq-bar-2" />
                <span className="w-1 bg-accent rounded-full eq-bar-3" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/15 px-3 py-1 rounded-full mb-3 border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Featured Track
            </div>

            <h1 className="text-[28px] md:text-[34px] font-semibold text-text-primary tracking-[-0.6px] truncate leading-tight">
              {featuredTrack.title}
            </h1>

            <p className="text-[14px] text-text-muted mt-1.5 truncate">
              <span className="text-text-primary font-medium">{featuredTrack.artist}</span>
              {featuredTrack.album && <span> • {featuredTrack.album}</span>}
              {featuredTrack.duration_seconds && (
                <span className="text-text-dim">
                  {' '}• {formatDuration(featuredTrack.duration_seconds)}
                </span>
              )}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-3.5 mt-6">
              <button
                onClick={handleHeroPlay}
                className="px-6 py-2.5 rounded-full bg-accent text-white text-[13px] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-accent/30"
              >
                {isHeroPlaying ? (
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
                    Play Now
                  </>
                )}
              </button>

              <button
                onClick={() => play(featuredTrack, trendingTracks)}
                className="px-5 py-2.5 rounded-full bg-surface2 border border-border-col text-text-primary text-[13px] font-medium hover:bg-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
              >
                Play with Queue
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Trending Section */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary tracking-[-0.3px]">
              Trending Hits
            </h2>
            <p className="text-[12px] text-text-muted">Top streamed anthems this week</p>
          </div>
          <span className="text-[12px] text-accent font-medium cursor-pointer hover:underline">
            View Chart
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-[6px] bg-surface/60 animate-pulse border border-border-col/30"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-col/40 bg-surface/30 rounded-[10px] border border-border-col/60 p-1">
            {trendingTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                queue={trendingTracks}
                isLiked={likedTrackIds.has(track.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Featured Playlists */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary tracking-[-0.3px]">
              Curated Playlists
            </h2>
            <p className="text-[12px] text-text-muted">Hand-picked mixes for every mood</p>
          </div>
          <Link
            to="/library"
            className="text-[12px] text-text-muted hover:text-text-primary transition-colors"
          >
            Explore all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userPlaylists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      </section>

      {/* 4. Fresh Releases & Recommendations */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary tracking-[-0.3px]">
              Fresh Singles & Hot Picks
            </h2>
            <p className="text-[12px] text-text-muted">New songs turning heads</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {recentTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={recentTracks}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
