import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Track } from '../types'

export default function useTracks(params?: { search?: string; genre?: string; sort?: string }) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  async function fetchTracks() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.tracks.getAll(params)
      setTracks(res.tracks || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()
  }, [params?.search, params?.genre, params?.sort])

  return { tracks, loading, error, refresh: fetchTracks }
}
