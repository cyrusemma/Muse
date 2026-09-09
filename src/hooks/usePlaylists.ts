import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Playlist } from '../types'

export default function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetch() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.playlists.getAll()
      setPlaylists(res.playlists || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return { playlists, loading, error, refresh: fetch }
}
