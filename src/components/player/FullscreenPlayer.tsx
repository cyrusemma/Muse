import React, { useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { AudioVisualizer } from './AudioVisualizer'

export const FullscreenPlayer: React.FC = () => {
  const isFullscreenOpen = usePlayerStore((state) => state.isFullscreenOpen)
  const setFullscreenOpen = usePlayerStore((state) => state.setFullscreenOpen)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const progress = usePlayerStore((state) => state.progress)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const isMuted = usePlayerStore((state) => state.isMuted)
  const isShuffled = usePlayerStore((state) => state.isShuffled)
  const repeatMode = usePlayerStore((state) => state.repeatMode)

  const pause = usePlayerStore((state) => state.pause)
  const resume = usePlayerStore((state) => state.resume)
  const next = usePlayerStore((state) => state.next)
  const prev = usePlayerStore((state) => state.prev)
  const seek = usePlayerStore((state) => state.seek)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const toggleMute = usePlayerStore((state) => state.toggleMute)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat)
  const toggleQueue = usePlayerStore((state) => state.toggleQueue)
  const toggleLyrics = usePlayerStore((state) => state.toggleLyrics)

  const [isLiked, setIsLiked] = useState(false)

  if (!isFullscreenOpen || !currentTrack) return null

  const currentTimeSec = Math.floor(progress * duration)
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/90 p-6 md:p-12 backdrop-blur-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Dynamic Ambient Background Glow from Cover */}
      <div
        className="absolute inset-0 -z-10 opacity-30 blur-3xl scale-125"
        style={{
          backgroundImage: `radial-gradient(circle at center, #7C5CFC 0%, #1A0B2E 70%, #080808 100%)`,
        }}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-[#7C5CFC] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#A78BFA]">
            Playing from Muse
          </span>
        </div>

        <button
          onClick={() => setFullscreenOpen(false)}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-all shadow"
        >
          <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
          Exit Fullscreen
        </button>
      </div>

      {/* Center Artwork & Visualizer */}
      <div className="my-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl mx-auto w-full">
        {/* Cover Artwork */}
        <div className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#7C5CFC] to-[#EC4899] opacity-30 blur-xl group-hover:opacity-60 transition duration-500" />
          <img
            src={currentTrack.cover_url || '/placeholder.png'}
            alt={currentTrack.title}
            className="relative h-64 w-64 md:h-80 md:w-80 rounded-2xl object-cover shadow-2xl border border-white/10"
          />
        </div>

        {/* Track Details + Visualizer */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-md">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#A78BFA] backdrop-blur-md">
            {currentTrack.genre || 'Trending Sound'}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {currentTrack.title}
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 font-medium">
            {currentTrack.artist}
          </p>

          {/* Real-time Visualizer */}
          <div className="pt-2 w-full flex justify-center md:justify-start">
            <AudioVisualizer barCount={48} barWidth={4} gap={3} height={50} />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {/* Progress Slider */}
        <div className="space-y-1">
          <div
            className="relative h-2 w-full cursor-pointer rounded-full bg-white/20 overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              seek(Math.max(0, Math.min(1, pct)))
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#EC4899] transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-mono">
            <span>{formatTime(currentTimeSec)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Action buttons & Transport */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full hover:bg-white/10 transition-all ${
                isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isLiked ? 0 : 1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={toggleLyrics}
              className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              title="Lyrics (L)"
            >
              <svg className="h-6 w-6 fill-none stroke-current stroke-1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0v7.5a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          {/* Center transport controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-colors ${
                isShuffled ? 'text-[#7C5CFC]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            <button
              onClick={prev}
              className="p-3 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              title="Previous"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#906BFF] text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={next}
              className="p-3 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              title="Next"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-[#7C5CFC]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Repeat"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>

          {/* Right utility buttons (Volume + Queue) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5 fill-current text-neutral-500" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-[#7C5CFC] cursor-pointer"
              />
            </div>
            <button
              onClick={toggleQueue}
              className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              title="Queue (Q)"
            >
              <svg className="h-6 w-6 fill-none stroke-current stroke-1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
