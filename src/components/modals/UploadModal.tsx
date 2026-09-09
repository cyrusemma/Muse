import React, { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDuration } from '../../lib/utils'

interface UploadModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAudioFile(file)
    if (!title) {
      // Auto-populate title from filename without extension
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      setTitle(cleanName)
    }

    // Extract duration using temp Audio element
    try {
      const tempAudio = new Audio()
      const objectUrl = URL.createObjectURL(file)
      tempAudio.src = objectUrl
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && !isNaN(tempAudio.duration)) {
          setDuration(Math.floor(tempAudio.duration))
        }
        URL.revokeObjectURL(objectUrl)
      }
      tempAudio.onerror = () => {
        URL.revokeObjectURL(objectUrl)
      }
    } catch (err) {
      console.warn('Could not extract duration:', err)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverFile(file)
    const previewUrl = URL.createObjectURL(file)
    setCoverPreview(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to upload tracks.')
      return
    }
    if (!audioFile) {
      setError('Please select an audio file (MP3, WAV, etc.).')
      return
    }
    if (!title.trim() || !artist.trim()) {
      setError('Please provide both Title and Artist.')
      return
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Add your credentials to .env')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(15)

    try {
      // 1. Upload Audio to 'audio' bucket
      const sanitizedAudioName = audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const audioPath = `${user.id}/${Date.now()}-${sanitizedAudioName}`
      
      setUploadProgress(30)
      const { error: audioUploadError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (audioUploadError) {
        throw new Error(`Audio upload failed: ${audioUploadError.message}`)
      }

      const { data: audioUrlData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)
      const audioUrl = audioUrlData.publicUrl

      setUploadProgress(65)

      // 2. Upload Cover if provided
      let coverUrl: string | null = null
      if (coverFile) {
        const sanitizedCoverName = coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const coverPath = `${user.id}/${Date.now()}-${sanitizedCoverName}`
        const { error: coverUploadError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!coverUploadError) {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverPath)
          coverUrl = coverUrlData.publicUrl
        }
      }

      setUploadProgress(85)

      // 3. Insert into tracks table
      const { error: insertError } = await supabase.from('tracks').insert({
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim() || null,
        audio_url: audioUrl,
        cover_url: coverUrl,
        duration_seconds: duration || null,
        uploaded_by: user.id,
      })

      if (insertError) {
        throw new Error(`Failed to save track: ${insertError.message}`)
      }

      setUploadProgress(100)
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 400)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to upload track.')
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[500px] bg-surface border border-border-col rounded-[12px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-border-col">
          <h2 className="text-[18px] font-semibold text-text-primary">
            Upload Track
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-[18px] leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {error && (
            <div className="p-3 text-[13px] text-red-400 bg-red-950/40 border border-red-800/50 rounded-[6px]">
              {error}
            </div>
          )}

          {/* Audio File Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-muted">
              Audio File <span className="text-accent">*</span>
            </label>
            <div className="relative border border-dashed border-border-col rounded-[8px] p-4 text-center hover:border-accent/60 transition-colors bg-surface2/40 cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                required
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-1.5">
                <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                {audioFile ? (
                  <div>
                    <p className="text-[13px] font-medium text-text-primary truncate max-w-[320px]">
                      {audioFile.name}
                    </p>
                    {duration > 0 && (
                      <p className="text-[11px] text-text-dim">
                        Duration: {formatDuration(duration)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-[13px] text-text-primary">
                      Click or drag audio file here
                    </p>
                    <p className="text-[11px] text-text-dim">
                      MP3, WAV, FLAC, AAC up to 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title & Artist */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">
                Track Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. City Boys"
                className="w-full px-3 py-2 bg-surface2 border border-border-col rounded-[6px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-muted">
                Artist Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Burna Boy"
                className="w-full px-3 py-2 bg-surface2 border border-border-col rounded-[6px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none"
              />
            </div>
          </div>

          {/* Album */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-muted">
              Album (optional)
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="e.g. I Told Them..."
              className="w-full px-3 py-2 bg-surface2 border border-border-col rounded-[6px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none"
            />
          </div>

          {/* Cover Art Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-muted">
              Cover Artwork (optional)
            </label>
            <div className="flex items-center gap-3">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-14 h-14 rounded-[5px] object-cover border border-border-col shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-[5px] bg-surface2 border border-border-col flex items-center justify-center text-text-dim text-[11px] shrink-0">
                  No Art
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="text-[12px] text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border file:border-border-col file:bg-surface2 file:text-text-primary file:text-[12px] file:cursor-pointer hover:file:bg-[#2A2A2A]"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="w-full flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-col mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-[6px] text-[13px] text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !audioFile}
              className="px-5 py-2 rounded-[6px] bg-accent text-white text-[13px] font-medium hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {uploading ? 'Uploading...' : 'Publish Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
