import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CreatePlaylistModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trackIds, setTrackIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) { setMessage('Please provide a playlist name'); return }
    setLoading(true)
    setMessage(null)
    try {
      const insertRes = await supabase.from('playlists').insert({ name, description }).select('id')
      if (insertRes.error) throw insertRes.error
      const playlistId = insertRes.data?.[0]?.id
      if (trackIds.trim() && playlistId) {
        const ids = trackIds.split(',').map(s => s.trim()).filter(Boolean)
        const rows = ids.map((tid: string, idx: number) => ({ playlist_id: playlistId, track_id: tid, order: idx }))
        const ptRes = await supabase.from('playlist_tracks').insert(rows)
        if (ptRes.error) throw ptRes.error
      }
      setMessage('Playlist created')
      setName('')
      setDescription('')
      setTrackIds('')
    } catch (err: any) {
      console.error(err)
      setMessage(err?.message || 'Failed to create playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ width: 520, background: 'var(--surface)', padding: 20, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
        <h2 style={{ margin: 0, color: 'var(--text)' }}>Create Playlist</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Playlist name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }} />
          <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }} />
          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Add track IDs (comma separated)</label>
          <input placeholder="track1, track2" value={trackIds} onChange={(e) => setTrackIds(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }} />

          {message && <div style={{ color: '#ffd6d6' }}>{message}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff' }}>{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
