import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Track } from '../types'

export default function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    try {
      const res = await supabase.from('tracks').select('*').order('created_at', { ascending: false })
      if (res.error) throw res.error
      setTracks(res.data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return { tracks, loading, error, refresh: fetch }
}
