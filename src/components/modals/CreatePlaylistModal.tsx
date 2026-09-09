import React, { useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface CreatePlaylistModalProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function CreatePlaylistModal({
  onClose,
  onSuccess,
}: CreatePlaylistModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a playlist.')
      return
    }
    if (!name.trim()) {
      setError('Please provide a playlist name.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      if (description.trim()) formData.append('description', description.trim())
      formData.append('is_public', String(isPublic))
      if (coverFile) {
        formData.append('cover', coverFile)
      }

      await api.playlists.create(formData)

      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Create playlist error:', err)
      setError(err?.message || 'Failed to create playlist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[460px] bg-surface border border-border-col rounded-[12px] p-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-border-col">
          <h2 className="text-[18px] font-semibold text-text-primary">
            New Playlist
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-muted">
              Playlist Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midnight Chill"
              className="w-full px-3 py-2 bg-surface2 border border-border-col rounded-[6px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-muted">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a vibe description..."
              className="w-full px-3 py-2 bg-surface2 border border-border-col rounded-[6px] text-[13px] text-text-primary placeholder:text-text-dim focus:outline-none resize-none"
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
                  className="w-12 h-12 rounded-[5px] object-cover border border-border-col shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-[5px] bg-surface2 border border-border-col flex items-center justify-center text-text-dim text-[11px] shrink-0">
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

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded bg-surface2 border-border-col text-accent accent-accent cursor-pointer"
            />
            <label
              htmlFor="isPublic"
              className="text-[13px] text-text-primary cursor-pointer select-none"
            >
              Make playlist public
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-col mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-[6px] text-[13px] text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-[6px] bg-accent text-white text-[13px] font-medium hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
