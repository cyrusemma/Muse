import { useState, useEffect } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { formatDuration, truncate } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import CoverArt from '../ui/CoverArt'
import { AudioVisualizer } from '../player/AudioVisualizer'

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffled,
    repeatMode,
    isQueueOpen,
    isLyricsOpen,
    pause,
    resume,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleQueue,
    toggleLyrics,
    toggleFullscreen,
    toggleMute,
  } = usePlayerStore()

  const { user } = useAuth()
  const [liked, setLiked] = useState(false)

  // Check like status when track changes
  useEffect(() => {
    if (!currentTrack || !user || !isSupabaseConfigured) {
      setLiked(false)
      return
    }
    let alive = true
    supabase
      .from('liked_tracks')
      .select('track_id')
      .eq('user_id', user.id)
      .eq('track_id', currentTrack.id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setLiked(Boolean(data))
      })
      .catch(() => {
        if (alive) setLiked(false)
      })
    return () => {
      alive = false
    }
  }, [currentTrack?.id, user?.id])

  const handlePlayPause = () => (isPlaying ? pause() : resume())

  const handleLike = async () => {
    if (!currentTrack) return
    const nextVal = !liked
    setLiked(nextVal)
    if (!user || !isSupabaseConfigured) return
    try {
      if (nextVal) {
        await supabase.from('liked_tracks').insert({ user_id: user.id, track_id: currentTrack.id })
      } else {
        await supabase.from('liked_tracks').delete().eq('user_id', user.id).eq('track_id', currentTrack.id)
      }
    } catch {
      setLiked(!nextVal)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
  }

  const displayDuration = duration || currentTrack?.duration_seconds || 0
  const currentSec = Math.floor((progress || 0) * displayDuration)

  return (
    <div
      style={{ gridColumn: '1 / span 2', gridRow: 2 }}
      className="h-[80px] flex items-center justify-between px-5 gap-4 bg-[#141414] border-t border-white/10 z-40 backdrop-blur-md"
    >
      {/* ── LEFT: Now Playing ── */}
      <div className="flex items-center gap-3 w-[260px] min-w-[180px] shrink-0">
        {currentTrack ? (
          <>
            <div className="relative shrink-0 group cursor-pointer" onClick={toggleFullscreen}>
              <CoverArt src={currentTrack.cover_url} trackId={currentTrack.id} size={46} borderRadius={6} />
              <div className="absolute inset-0 bg-black/40 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="h-4 w-4 fill-none stroke-white stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="text-[13px] font-medium text-white truncate leading-tight cursor-pointer hover:underline"
                  onClick={toggleFullscreen}
                >
                  {truncate(currentTrack.title, 22)}
                </div>
              </div>
              <div className="text-[12px] text-neutral-400 truncate mt-0.5">
                {currentTrack.artist}
              </div>
            </div>
            {/* Heart */}
            <button
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
              className={`p-1.5 rounded transition-all hover:scale-110 active:scale-95 shrink-0 ${
                liked ? 'text-[#7C5CFC]' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={liked ? 0 : 1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 opacity-30">
            <div className="w-[46px] h-[46px] rounded-[6px] bg-white/5" />
            <span className="text-[13px] text-neutral-500">Nothing playing</span>
          </div>
        )}
      </div>

      {/* ── CENTER: Controls + Scrubber ── */}
      <div className="flex-1 max-w-[560px] flex flex-col items-center gap-1.5 mx-auto">
        {/* Buttons row */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            title={isShuffled ? 'Shuffle on' : 'Shuffle off'}
            className={`relative p-1 transition-colors ${
              isShuffled ? 'text-[#7C5CFC]' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
            {isShuffled && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7C5CFC]" />
            )}
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-[36px] h-[36px] rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
          >
            {isPlaying ? (
              <svg className="w-[14px] h-[14px] fill-black" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-[14px] h-[14px] fill-black ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Next"
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            aria-label={`Repeat: ${repeatMode}`}
            title={`Repeat: ${repeatMode}`}
            className={`relative p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-[#7C5CFC]' : 'text-neutral-500 hover:text-white'
            }`}
          >
            <svg className="w-[15px] h-[15px] fill-current" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
            {repeatMode === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold bg-[#7C5CFC] text-white rounded-full w-3 h-3 flex items-center justify-center leading-none">
                1
              </span>
            )}
            {repeatMode !== 'off' && repeatMode !== 'one' && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7C5CFC]" />
            )}
          </button>
        </div>

        {/* Scrubber row */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[11px] text-neutral-400 font-mono tabular-nums w-8 text-right shrink-0">
            {formatDuration(currentSec)}
          </span>

          {/* Seek bar */}
          <div
            onClick={handleSeek}
            className="group relative flex-1 h-4 flex items-center cursor-pointer"
          >
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#A78BFA] group-hover:brightness-125 rounded-full transition-all duration-150"
                style={{ width: `${(progress || 0) * 100}%` }}
              />
            </div>
            {/* Thumb dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
              style={{ left: `${(progress || 0) * 100}%` }}
            />
          </div>

          <span className="text-[11px] text-neutral-400 font-mono tabular-nums w-8 shrink-0">
            {formatDuration(Math.floor(displayDuration))}
          </span>
        </div>
      </div>

      {/* ── RIGHT: Visualizer, Lyrics, Queue, Volume, Fullscreen ── */}
      <div className="flex items-center gap-3 w-[260px] justify-end shrink-0">
        {/* Equalizer mini visualizer */}
        {currentTrack && (
          <div className="hidden lg:block">
            <AudioVisualizer barCount={12} barWidth={2} gap={2} height={20} />
          </div>
        )}

        {/* Lyrics Drawer Toggle */}
        <button
          onClick={toggleLyrics}
          title="Lyrics (L)"
          className={`p-1.5 rounded-lg transition-colors ${
            isLyricsOpen ? 'text-[#7C5CFC] bg-white/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0v7.5a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Queue Drawer Toggle */}
        <button
          onClick={toggleQueue}
          title="Queue (Q)"
          className={`p-1.5 rounded-lg transition-colors ${
            isQueueOpen ? 'text-[#7C5CFC] bg-white/10' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            aria-label="Toggle mute"
            title="Mute (M)"
            className="text-neutral-400 hover:text-white p-1 transition-colors shrink-0"
          >
            {volume === 0 ? (
              <svg className="w-4 h-4 fill-current text-neutral-500" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-[70px] accent-[#7C5CFC] cursor-pointer"
            aria-label="Volume"
          />
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Fullscreen (F)"
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
