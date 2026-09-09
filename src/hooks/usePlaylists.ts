import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Playlist } from '../types'

export default function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    try {
      const res = await supabase.from('playlists').select('*').order('created_at', { ascending: false })
      if (res.error) throw res.error
      setPlaylists(res.data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return { playlists, loading, error, refresh: fetch }
}
