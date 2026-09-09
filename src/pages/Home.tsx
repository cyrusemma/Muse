import TrackRow from '../components/ui/TrackRow'
import PlaylistCard from '../components/ui/PlaylistCard'

const trending = [
  { id: 't1', title: 'City Boys', artist: 'Burna Boy', album: 'Burning', duration_seconds: 210, cover_url: null, audio_url: '', uploaded_by: null, play_count: 120, created_at: '' },
  { id: 't2', title: 'Kilometre', artist: 'Sauti Sol', album: 'Road', duration_seconds: 195, cover_url: null, audio_url: '', uploaded_by: null, play_count: 95, created_at: '' },
  { id: 't3', title: 'Feel Good', artist: 'Tems', album: 'Vibes', duration_seconds: 202, cover_url: null, audio_url: '', uploaded_by: null, play_count: 88, created_at: '' },
  { id: 't4', title: 'Sunrise', artist: 'Davido', album: 'Morning', duration_seconds: 180, cover_url: null, audio_url: '', uploaded_by: null, play_count: 70, created_at: '' },
  { id: 't5', title: 'No Wahala', artist: 'Ric Hassani', album: 'Easy', duration_seconds: 230, cover_url: null, audio_url: '', uploaded_by: null, play_count: 60, created_at: '' },
]

const playlists = [
  { id: 'p1', name: 'Made for you: Sunrise', coverA: '#7C5CFC', coverB: '#3B8BD4' },
  { id: 'p2', name: 'Made for you: Chill', coverA: '#1D9E75', coverB: '#04342C' },
  { id: 'p3', name: 'Made for you: Focus', coverA: '#E8583C', coverB: '#7a1a0a' },
  { id: 'p4', name: 'Made for you: Drive', coverA: '#D4537E', coverB: '#4a0a28' },
  { id: 'p5', name: 'Made for you: Party', coverA: '#F2A623', coverB: '#7a4a00' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 28 }}>
        <div style={{ width: 220, height: 220, borderRadius: 12, background: 'linear-gradient(135deg,var(--accent), #3B8BD4)' }} />
        <div>
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>City Boys</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>Burna Boy • Trending single • 3:30</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '10px 14px', background: 'var(--accent)', color: '#000', borderRadius: 8 }}>Play</button>
            <button style={{ padding: '10px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8 }}>Add to library</button>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Trending</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trending.map((t, i) => <TrackRow key={t.id} track={t as any} index={i} queue={trending as any} />)}
        </div>
      </section>

      {/* Made for you */}
      <section>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Made for you</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {playlists.map(p => <PlaylistCard key={p.id} name={p.name} coverA={p.coverA} coverB={p.coverB} />)}
        </div>
      </section>
    </div>
  )
}
