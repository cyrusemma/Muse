import React, { useMemo } from 'react'
import { usePlayerStore } from '../../store/playerStore'

export const LyricsDrawer: React.FC = () => {
  const isLyricsOpen = usePlayerStore((state) => state.isLyricsOpen)
  const setLyricsOpen = usePlayerStore((state) => state.setLyricsOpen)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const progress = usePlayerStore((state) => state.progress)

  // Generate stylized synchronized lyrics preview based on current track metadata
  const lyricsLines = useMemo(() => {
    if (!currentTrack) return []

    return [
      { time: 0.05, text: `♪ Intro instrumental — ${currentTrack.genre || 'Vibes'} ♪` },
      { time: 0.15, text: `Feeling the rhythm moving through the late night air` },
      { time: 0.28, text: `Every frequency aligning, taking over everywhere` },
      { time: 0.40, text: `[Chorus] That's why we listen to Muse sound` },
      { time: 0.52, text: `Pure harmony when the baseline starts to pound` },
      { time: 0.65, text: `Echoes across the skyline, never coming down` },
      { time: 0.78, text: `[Bridge] Higher and higher into the atmosphere` },
      { time: 0.90, text: `Feel the wave, there is only music here` },
      { time: 0.98, text: `♪ Outro fade ♪` },
    ]
  }, [currentTrack])

  if (!isLyricsOpen || !currentTrack) return null

  // Find active line index based on progress
  let activeIndex = 0
  for (let i = 0; i < lyricsLines.length; i++) {
    if (progress >= lyricsLines[i].time) {
      activeIndex = i
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setLyricsOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-[#111115]/95 border-l border-white/10 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#EC4899] text-white shadow-md">
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0v7.5a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Lyrics
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#A78BFA] bg-[#7C5CFC]/20 px-2 py-0.5 rounded-full">
                  Live Synced
                </span>
              </h2>
              <p className="text-xs text-neutral-400 truncate max-w-[240px]">
                {currentTrack.title} • {currentTrack.artist}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLyricsOpen(false)}
            className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Lyrics Stream */}
        <div className="flex-1 overflow-y-auto py-8 space-y-6 flex flex-col justify-center scroll-smooth">
          {lyricsLines.map((line, idx) => {
            const isActive = idx === activeIndex
            const isPassed = idx < activeIndex

            return (
              <p
                key={idx}
                className={`text-xl md:text-2xl font-bold tracking-tight transition-all duration-300 ${
                  isActive
                    ? 'text-white scale-105 origin-left drop-shadow-[0_0_16px_rgba(124,92,252,0.8)]'
                    : isPassed
                    ? 'text-neutral-500 opacity-60 hover:opacity-80'
                    : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                {line.text}
              </p>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 text-center text-xs text-neutral-500">
          Lyrics synchronized for Muse Audio Engine
        </div>
      </div>
    </div>
  )
}
