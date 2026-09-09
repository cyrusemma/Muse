import { useState } from 'react'
import TrackRow from '../components/ui/TrackRow'

const genres = [
  { id: 'g1', name: 'Afrobeats', colorA: '#7C5CFC', colorB: '#3B8BD4' },
  { id: 'g2', name: 'Hip-hop', colorA: '#1D9E75', colorB: '#04342C' },
  { id: 'g3', name: 'R&B', colorA: '#E8583C', colorB: '#7a1a0a' },
  { id: 'g4', name: 'Pop', colorA: '#D4537E', colorB: '#4a0a28' },
  { id: 'g5', name: 'Jazz', colorA: '#F2A623', colorB: '#7a4a00' },
  { id: 'g6', name: 'Gospel', colorA: '#3B8BD4', colorB: '#042C53' },
]

export default function Search() {
  const [query, setQuery] = useState('')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>🔍</div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracks, artists, albums" style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Genres</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {genres.map(g => (
          <div key={g.id} style={{ height: 120, borderRadius: 10, background: `linear-gradient(135deg, ${g.colorA}, ${g.colorB})`, display: 'flex', alignItems: 'flex-end', padding: 12, color: '#000', fontWeight: 600 }}>{g.name}</div>
        ))}
      </div>
    </div>
  )
}
