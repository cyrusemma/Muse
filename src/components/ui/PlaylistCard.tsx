import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Playlist, Track } from '../../types'
import { usePlayerStore } from '../../store/playerStore'
import { api } from '../../services/api'
import { DEMO_TRACKS } from '../../lib/mockData'

interface PlaylistCardProps {
  playlist: Playlist
}

const PALETTE_A = ['#7C5CFC', '#1D9E75', '#E8583C', '#3B8BD4', '#D4537E', '#F2A623']
const PALETTE_B = ['#3B1FA8', '#04342C', '#7a1a0a', '#042C53', '#4a0a28', '#7a4a00']

function hashId(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0
  return n
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const navigate = useNavigate()
  const { play } = usePlayerStore()

  const handleCardClick = () => navigate(`/playlist/${playlist.id}`)

  const handleQuickPlay = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const res = await api.playlists.getById(playlist.id)
      const tracks: Track[] = res.playlist?.tracks || []
      if (tracks.length > 0) {
        play(tracks[0], tracks)
        return
      }
    } catch (err) {
      console.warn('Quick play error:', err)
    }

    // Fallback to demo tracks
    if (DEMO_TRACKS.length > 0) play(DEMO_TRACKS[0], DEMO_TRACKS)
  }

  const idx = hashId(playlist.id) % PALETTE_A.length
  const bg = `linear-gradient(145deg, ${PALETTE_A[idx]}, ${PALETTE_B[idx]})`
  const trackCount = playlist.track_count ?? 0

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col gap-3 p-3 rounded-[10px] bg-surface hover:bg-surface2 border border-border-col hover:border-white/10 cursor-pointer transition-all duration-200"
    >
      {/* Cover Art */}
      <div className="relative w-full aspect-square overflow-hidden rounded-[8px]">
        {playlist.cover_url ? (
          <img
            src={playlist.cover_url}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: bg }}
          >
            <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.35)" className="w-1/3 h-1/3">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
            </svg>
          </div>
        )}

        {/* Quick Play button */}
        <button
          onClick={handleQuickPlay}
          aria-label={`Play ${playlist.name}`}
          className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-xl opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-text-primary truncate leading-tight">
          {playlist.name}
        </h4>
        <p className="text-[12px] text-text-muted mt-0.5 truncate">
          {playlist.description
            ? playlist.description
            : `${trackCount} ${trackCount === 1 ? 'song' : 'songs'}`}
        </p>
      </div>
    </div>
  )
}
