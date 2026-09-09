import React, { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Add your credentials to .env')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('playlists').insert({
        name: name.trim(),
        description: description.trim() || null,
        owner_id: user.id,
        is_public: isPublic,
      })

      if (insertError) throw insertError

      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to create playlist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[440px] bg-surface border border-border-col rounded-[12px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
              placeholder="e.g. Afrobeats Chill"
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
