import React from 'react'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/playerStore'
import { formatDuration } from '../../lib/utils'
import CoverArt from './CoverArt'

interface TrackCardProps {
  track: Track
  queue?: Track[]
}

export default function TrackCard({ track, queue = [] }: TrackCardProps) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore()
  const isCurrent = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrent && isPlaying

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrent) {
      if (isPlaying) pause()
      else resume()
    } else {
      play(track, queue.length > 0 ? queue : [track])
    }
  }

  const handleCardClick = () => {
    if (!isCurrent) play(track, queue.length > 0 ? queue : [track])
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-3 rounded-[10px] cursor-pointer border transition-all duration-200 flex flex-col gap-3 ${
        isCurrent
          ? 'bg-accent/10 border-accent/30 hover:bg-accent/15'
          : 'bg-surface hover:bg-surface2 border-border-col hover:border-white/10'
      }`}
    >
      {/* Cover art square */}
      <div className="relative w-full aspect-square overflow-hidden rounded-[6px]">
        <div className="w-full h-full">
          <CoverArt
            src={track.cover_url}
            trackId={track.id}
            size={200}
            borderRadius={0}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Play button overlay */}
        <button
          onClick={handlePlayClick}
          aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
          className={`absolute right-2 bottom-2 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-xl transition-all duration-200 ${
            isCurrentlyPlaying
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105'
          }`}
        >
          {isCurrentlyPlaying ? (
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Playing indicator overlay */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 flex items-end gap-px bg-black/60 backdrop-blur-md px-1.5 py-1 rounded-md">
            <span className="w-0.5 bg-accent rounded-full eq-bar-1" style={{ height: '12px' }} />
            <span className="w-0.5 bg-accent rounded-full eq-bar-2" style={{ height: '8px' }} />
            <span className="w-0.5 bg-accent rounded-full eq-bar-3" style={{ height: '14px' }} />
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="min-w-0">
        <h4 className={`text-[13px] font-semibold truncate leading-tight ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>
          {track.title}
        </h4>
        <p className="text-[12px] text-text-muted truncate mt-0.5">
          {track.artist}
        </p>
        {track.duration_seconds && (
          <p className="text-[11px] text-text-dim mt-1 font-mono">
            {formatDuration(track.duration_seconds)}
          </p>
        )}
      </div>
    </div>
  )
}
