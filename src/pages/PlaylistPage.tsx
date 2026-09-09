import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { PlaylistTrack, Track } from '../types'
import TrackRow from '../components/ui/TrackRow'

export default function PlaylistPage() {
  const { id } = useParams()
  const [tracks, setTracks] = useState<Track[]>([])
  const [name, setName] = useState('')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data: pl } = await supabase.from('playlists').select('*').eq('id', id).single()
      setName(pl?.name ?? '')
      const { data: pts } = await supabase.from('playlist_tracks').select('*, track:tracks(*)').eq('playlist_id', id).order('position')
      setTracks((pts ?? []).map((p: any) => p.track))
    })()
  }, [id])

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>{name}</h2>
      {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={tracks} />)}
      {tracks.length === 0 && <div style={{ color: '#888' }}>No tracks in this playlist.</div>}
    </div>
  )
}
