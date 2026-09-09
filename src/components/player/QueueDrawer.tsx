import React from 'react'
import { usePlayerStore } from '../../store/playerStore'

export const QueueDrawer: React.FC = () => {
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen)
  const setQueueOpen = usePlayerStore((state) => state.setQueueOpen)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const queue = usePlayerStore((state) => state.queue)
  const queueIndex = usePlayerStore((state) => state.queueIndex)
  const play = usePlayerStore((state) => state.play)
  const removeFromQueue = usePlayerStore((state) => state.removeFromQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  if (!isQueueOpen) return null

  const upNextTracks = queue.slice(queueIndex + 1)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setQueueOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#141414]/95 border-l border-white/10 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C5CFC]/20 text-[#A78BFA]">
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Play Queue</h2>
              <p className="text-xs text-neutral-400">
                {queue.length} track{queue.length !== 1 ? 's' : ''} in queue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                title="Clear queue"
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
              >
                <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Clear
              </button>
            )}
            <button
              onClick={() => setQueueOpen(false)}
              className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Queue Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Currently Playing */}
          {currentTrack && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
                Now Playing
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.07] p-3 border border-[#7C5CFC]/30 shadow-lg">
                <img
                  src={currentTrack.cover_url || '/placeholder.png'}
                  alt={currentTrack.title}
                  className="h-12 w-12 rounded-lg object-cover shadow"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{currentTrack.title}</p>
                  <p className="truncate text-xs text-neutral-400">{currentTrack.artist}</p>
                </div>
                {isPlaying && (
                  <div className="flex items-center gap-0.5">
                    <span className="h-3 w-1 animate-bounce rounded-full bg-[#7C5CFC] [animation-delay:-0.3s]" />
                    <span className="h-4 w-1 animate-bounce rounded-full bg-[#7C5CFC] [animation-delay:-0.15s]" />
                    <span className="h-2 w-1 animate-bounce rounded-full bg-[#7C5CFC]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Up Next ({upNextTracks.length})
              </span>
            </div>

            {upNextTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center">
                <svg className="h-8 w-8 text-neutral-500 mb-2 fill-none stroke-current stroke-1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a.75.75 0 00.532-.72v-4.664M9 9v9.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66A.75.75 0 009 18.414V9zm0 0l10.5-3" />
                </svg>
                <p className="text-sm font-medium text-neutral-400">Queue is empty</p>
                <p className="text-xs text-neutral-500 mt-1">Play an album or playlist to add tracks</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {upNextTracks.map((track, relativeIdx) => {
                  const absoluteIdx = queueIndex + 1 + relativeIdx
                  return (
                    <div
                      key={`${track.id}-${absoluteIdx}`}
                      className="group flex items-center justify-between gap-3 rounded-lg p-2.5 hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/5"
                    >
                      <div
                        className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
                        onClick={() => play(track, queue)}
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                          <img
                            src={track.cover_url || '/placeholder.png'}
                            alt={track.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-4 w-4 fill-white text-white" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white group-hover:text-[#A78BFA] transition-colors">
                            {track.title}
                          </p>
                          <p className="truncate text-xs text-neutral-400">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 font-mono">
                          {Math.floor(track.duration_seconds / 60)}:
                          {String(track.duration_seconds % 60).padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => removeFromQueue(absoluteIdx)}
                          title="Remove from queue"
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all p-1"
                        >
                          <svg className="h-3.5 w-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
