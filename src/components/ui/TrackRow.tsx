import React from 'react'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/playerStore'
import CoverArt from './CoverArt'

interface TrackRowProps {
  track: Track
  index: number
  queue: Track[]
}

export default function TrackRow({ track, index, queue }: TrackRowProps) {
  const play = usePlayerStore(state => state.play)
  const current = usePlayerStore(state => state.currentTrack)
  const isCurrent = current?.id === track.id

  return (
    <div onClick={() => play(track, queue)} style={{ display: 'grid', gridTemplateColumns: '28px 44px 1fr 80px 60px 32px', gap: 8, alignItems: 'center', padding: '10px', borderRadius: 6, background: isCurrent ? 'rgba(124,92,252,0.06)' : 'transparent', cursor: 'pointer' }}>
      <div style={{ textAlign: 'center', color: isCurrent ? 'var(--accent)' : 'var(--muted)' }}>{isCurrent ? '♪' : index + 1}</div>
      <div style={{ width: 44, height: 44, position: 'relative' }}>
        <CoverArt src={track.cover_url} trackId={track.id} size={44} borderRadius={5} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 120ms' }} className="play-overlay">▶</div>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 500, color: isCurrent ? 'var(--accent)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{track.artist}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{track.album ?? ''}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{track.duration_seconds ? `${Math.floor((track.duration_seconds||0)/60)}:${String((track.duration_seconds||0)%60).padStart(2,'0')}` : ''}</div>
      <div><button onClick={(e) => { e.stopPropagation(); /* like toggle placeholder */ }} style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}>♡</button></div>
    </div>
  )
}
