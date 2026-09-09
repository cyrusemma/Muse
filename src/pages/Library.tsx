import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import TrackRow from '../components/ui/TrackRow'
import type { Track } from '../types'

export default function Library() {
  const { user } = useAuth()
  const [liked, setLiked] = useState<Track[]>([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase.from('liked_tracks').select('*, track:tracks(*)').eq('user_id', user.id).order('liked_at', { ascending: false })
      setLiked((data ?? []).map((r: any) => r.track))
    })()
  }, [user])

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Liked songs</h2>
      {liked.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={liked} />)}
      {liked.length === 0 && <div style={{ color: '#888' }}>No liked songs yet.</div>}
    </div>
  )
}
