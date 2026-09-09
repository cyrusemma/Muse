import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import UploadModal from '../modals/UploadModal'
import CreatePlaylistModal from '../modals/CreatePlaylistModal'

const playlists = [
  { id: '1', name: 'Sunset Vibes', colorA: '#7C5CFC', colorB: '#3B8BD4' },
  { id: '2', name: 'Late Night', colorA: '#1D9E75', colorB: '#04342C' },
  { id: '3', name: 'Afro Heat', colorA: '#E8583C', colorB: '#7a1a0a' },
  { id: '4', name: 'Chill Mix', colorA: '#D4537E', colorB: '#4a0a28' },
  { id: '5', name: 'Workout', colorA: '#F2A623', colorB: '#7a4a00' },
  { id: '6', name: 'Throwbacks', colorA: '#3B8BD4', colorB: '#042C53' },
]

const artists = ['Burna Boy', 'Tems', 'Beyoncé', 'Kizz Daniel', 'Simi']

export default function Sidebar() {
  const [showUpload, setShowUpload] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  return (
    <>
      <aside style={{ background: 'var(--surface)', padding: 20, gridColumn: 1, gridRow: 1, borderRight: '1px solid var(--border)', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: 6, display: 'inline-block' }} />
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>wavr</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        <NavLink to="/" style={({ isActive }) => ({ padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(124,92,252,0.15)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text)', fontSize: 13, fontWeight: 500 })}>Home</NavLink>
        <NavLink to="/search" style={({ isActive }) => ({ padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(124,92,252,0.15)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text)', fontSize: 13, fontWeight: 500 })}>Search</NavLink>
        <NavLink to="/library" style={({ isActive }) => ({ padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(124,92,252,0.15)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text)', fontSize: 13, fontWeight: 500 })}>Your Library</NavLink>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => setShowUpload(true)} style={{ padding: '10px 12px', borderRadius: 8, background: 'linear-gradient(90deg,var(--accent), #6eaef7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>Upload</button>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 12px', borderRadius: 8, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13 }}>Create</button>
        </div>
      </nav>

      <div style={{ marginTop: 12 }}>
        <h3 style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>Your playlists</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playlists.map(pl => (
            <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${pl.colorA}, ${pl.colorB})` }} />
              <div style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{pl.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>Artists you follow</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {artists.map(a => (
            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)' }} />
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      </aside>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showCreate && <CreatePlaylistModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
