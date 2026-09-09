import { useMemo, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { formatDuration } from '../../lib/utils'

export default function PlayerBar() {
  // Hardcoded current track as requested
  const hardTrack = {
    id: 'hard1',
    title: 'City Boys',
    artist: 'Burna Boy',
    album: 'Burning',
    duration_seconds: 210,
    cover_url: null,
    audio_url: '',
    uploaded_by: null,
    play_count: 0,
    created_at: new Date().toISOString(),
  }

  const { isPlaying, seek, setVolume } = usePlayerStore(state => ({ isPlaying: state.isPlaying, seek: state.seek, setVolume: state.setVolume }))
  const [progress, setProgress] = useState(0.32)
  const duration = 210

  const timeNow = useMemo(() => Math.floor(duration * progress), [duration, progress])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const p = Math.max(0, Math.min(1, x / rect.width))
    setProgress(p)
    seek(p)
  }

  return (
    <div style={{ gridColumn: '1 / span 2', gridRow: 2, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '10px 18px', gap: 16 }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 320 }}>
        <div style={{ width: 46, height: 46, borderRadius: 6, background: 'linear-gradient(135deg,var(--accent), #3B8BD4)' }} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hardTrack.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{hardTrack.artist}</div>
        </div>
        <button style={{ marginLeft: 8, background: 'transparent', border: 'none', color: 'var(--muted)' }} aria-label="like">♡</button>
      </div>

      {/* Center */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}>🔀</button>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text)' }}>⏮️</button>
          <button style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isPlaying ? '⏸' : '▶'}</button>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text)' }}>⏭️</button>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}>🔁</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>{formatDuration(timeNow)}</div>
          <div style={{ flex: 1 }}>
            <div className="seek-thumb-parent" onClick={handleSeek} onMouseMove={() => {}} style={{ height: 8, background: 'var(--surface2)', borderRadius: 6, position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: 'var(--accent)', borderRadius: 6 }} />
              <div style={{ position: 'absolute', left: `${progress * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: 6, background: 'var(--text)', boxShadow: '0 0 0 4px rgba(124,92,252,0.12)' }} className="seek-thumb" />
            </div>
          </div>
          <div style={{ width: 44, fontSize: 12, color: 'var(--muted)' }}>{formatDuration(duration)}</div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width: 220, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}>🔊</button>
        <input type="range" min={0} max={1} step={0.01} defaultValue={0.9} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: 100 }} />
        <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}>☰</button>
      </div>
    </div>
  )
}
