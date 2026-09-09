import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function extractDuration(file: File) {
    return new Promise<number>((resolve) => {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      audio.addEventListener('loadedmetadata', () => {
        const d = audio.duration || 0
        URL.revokeObjectURL(url)
        resolve(d)
      })
      // fallback
      setTimeout(() => {
        URL.revokeObjectURL(url)
        resolve(0)
      }, 3000)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!audioFile) {
      setMessage('Please select an audio file')
      return
    }
    setUploading(true)
    setMessage(null)

    try {
      const duration = await extractDuration(audioFile)

      // upload audio
      const audioPath = `tracks/${Date.now()}_${audioFile.name}`
      const audioUpload = await supabase.storage.from('tracks').upload(audioPath, audioFile)
      if (audioUpload.error) throw audioUpload.error

      // upload cover if present
      let coverUrl = ''
      if (coverFile) {
        const coverPath = `covers/${Date.now()}_${coverFile.name}`
        const coverUpload = await supabase.storage.from('covers').upload(coverPath, coverFile)
        if (coverUpload.error) throw coverUpload.error
        const { publicURL } = supabase.storage.from('covers').getPublicUrl(coverPath)
        coverUrl = publicURL
      }

      // insert metadata into tracks table
      const insertRes = await supabase.from('tracks').insert({ title: title || audioFile.name, artist: artist || 'Unknown', audio_path: audioPath, cover_url: coverUrl, duration })
      if (insertRes.error) throw insertRes.error

      setMessage('Upload successful')
      setTitle('')
      setArtist('')
      setAudioFile(null)
      setCoverFile(null)
    } catch (err: any) {
      console.error(err)
      setMessage(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div style={{ width: 540, background: 'var(--surface)', padding: 20, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
        <h2 style={{ margin: 0, color: 'var(--text)' }}>Upload Track</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }} />
          <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }} />

          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Audio file</label>
          <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />

          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Cover (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />

          {message && <div style={{ color: '#ffd6d6' }}>{message}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancel</button>
            <button type="submit" disabled={uploading} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff' }}>{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
