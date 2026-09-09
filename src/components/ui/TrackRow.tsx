import React, { useState } from 'react'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/playerStore'
import { formatDuration } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import CoverArt from './CoverArt'

interface TrackRowProps {
  track: Track
  index: number
  queue: Track[]
  showAlbum?: boolean
  isLiked?: boolean
  onLikeToggle?: (trackId: string) => void
}

export default function TrackRow({
  track,
  index,
  queue,
  showAlbum = true,
  isLiked: initialLiked = false,
  onLikeToggle,
}: TrackRowProps) {
  const { currentTrack, isPlaying, play, pause, resume } = usePlayerStore()
  const { user } = useAuth()
  const [liked, setLiked] = useState(initialLiked || Boolean(track.is_liked))
  const [isHovered, setIsHovered] = useState(false)

  const isCurrent = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrent && isPlaying

  const handleRowClick = () => {
    if (isCurrent) {
      if (isPlaying) pause()
      else resume()
    } else {
      play(track, queue.length > 0 ? queue : [track])
    }
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextLiked = !liked
    setLiked(nextLiked)
    if (onLikeToggle) onLikeToggle(track.id)

    if (!user) return

    try {
      const res = await api.tracks.toggleLike(track.id)
      setLiked(res.is_liked)
    } catch (err) {
      console.warn('Like toggle failed:', err)
      setLiked(!nextLiked)
    }
  }

  return (
    <div
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group grid items-center px-3 py-2.5 rounded-[6px] transition-colors duration-100 cursor-pointer ${
        isCurrent
          ? 'bg-accent/10 hover:bg-accent/15'
          : 'hover:bg-white/5'
      }`}
      style={{
        gridTemplateColumns: showAlbum
          ? '32px 44px minmax(0,1fr) minmax(0,140px) 56px 36px'
          : '32px 44px minmax(0,1fr) 56px 36px',
        gap: '10px',
      }}
    >
      {/* 1. Index / Play indicator */}
      <div className="flex items-center justify-center w-8 shrink-0 select-none">
        {isHovered ? (
          <svg
            className={`w-3.5 h-3.5 fill-current ${isCurrent ? 'text-accent' : 'text-text-primary'}`}
            viewBox="0 0 24 24"
          >
            {isCurrentlyPlaying ? (
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        ) : isCurrent && isCurrentlyPlaying ? (
          // Animated equalizer bars when playing
          <div className="flex items-end gap-px h-4">
            <span className="w-0.5 bg-accent rounded-full eq-bar-1" style={{ height: '100%' }} />
            <span className="w-0.5 bg-accent rounded-full eq-bar-2" style={{ height: '70%' }} />
            <span className="w-0.5 bg-accent rounded-full eq-bar-3" style={{ height: '85%' }} />
          </div>
        ) : isCurrent ? (
          <svg className="w-3.5 h-3.5 fill-accent" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        ) : (
          <span className="text-[12px] text-text-dim font-normal tabular-nums">{index + 1}</span>
        )}
      </div>

      {/* 2. Cover Art */}
      <div className="relative w-11 h-11 shrink-0 rounded-[4px] overflow-hidden">
        <CoverArt src={track.cover_url} trackId={track.id} size={44} borderRadius={4} />
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              {isCurrentlyPlaying ? (
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* 3. Title & Artist */}
      <div className="min-w-0">
        <div
          className={`text-[13px] font-medium leading-tight truncate ${
            isCurrent ? 'text-accent' : 'text-text-primary'
          }`}
        >
          {track.title}
        </div>
        <div className="text-[12px] text-text-muted truncate mt-0.5 leading-tight">
          {track.artist}
        </div>
      </div>

      {/* 4. Album */}
      {showAlbum && (
        <div className="text-[12px] text-text-muted truncate min-w-0 hidden sm:block">
          {track.album || '—'}
        </div>
      )}

      {/* 5. Duration */}
      <div className="text-[12px] text-text-dim text-right font-mono tabular-nums shrink-0">
        {formatDuration(track.duration_seconds || 0)}
      </div>

      {/* 6. Like */}
      <div className="flex items-center justify-end shrink-0">
        <button
          onClick={handleLikeClick}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-1 rounded transition-all hover:scale-110 active:scale-95 ${
            liked
              ? 'text-accent'
              : 'text-text-dim opacity-0 group-hover:opacity-100 hover:text-red-400'
          }`}
        >
          <svg
            className="w-[15px] h-[15px]"
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
      </div>
    </div>
  )
}
