import { Router, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../config/db.js'
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// GET /api/playlists
router.get('/', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const currentUserId = req.user?.id

    const query = `
      SELECT 
        p.*,
        pr.username as owner_username,
        pr.display_name as owner_display_name,
        pr.avatar_url as owner_avatar_url,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as track_count
      FROM playlists p
      LEFT JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.is_public = 1 OR p.owner_id = ?
      ORDER BY p.created_at DESC
    `
    const playlists = db.prepare(query).all(currentUserId || '')
    return res.json({ playlists })
  } catch (err: any) {
    console.error('Get playlists error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch playlists.' })
  }
})

// GET /api/playlists/:id
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.id

    const playlistQuery = `
      SELECT 
        p.*,
        pr.username as owner_username,
        pr.display_name as owner_display_name,
        pr.avatar_url as owner_avatar_url,
        (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlist_id = p.id) as track_count
      FROM playlists p
      LEFT JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = ?
    `
    const playlist = db.prepare(playlistQuery).get(id) as any

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' })
    }

    // Check visibility
    if (!playlist.is_public && playlist.owner_id !== currentUserId) {
      return res.status(403).json({ error: 'Private playlist.' })
    }

    // Fetch playlist tracks
    const tracksQuery = `
      SELECT 
        t.*,
        pt.position,
        pt.added_at,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        CASE WHEN l.track_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM playlist_tracks pt
      JOIN tracks t ON pt.track_id = t.id
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      LEFT JOIN liked_tracks l ON t.id = l.track_id AND l.user_id = ?
      WHERE pt.playlist_id = ?
      ORDER BY pt.position ASC, pt.added_at ASC
    `
    const tracks = db.prepare(tracksQuery).all(currentUserId || '', id)

    return res.json({
      playlist: {
        ...playlist,
        tracks,
      },
    })
  } catch (err: any) {
    console.error('Get playlist detail error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch playlist.' })
  }
})

// POST /api/playlists
router.post('/', requireAuth, upload.single('cover'), (req: AuthRequest, res: Response): any => {
  try {
    const { name, description, is_public } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required.' })
    }

    let coverUrl: string | null = null
    if (req.file) {
      const serverBase = `${req.protocol}://${req.get('host')}`
      coverUrl = `${serverBase}/uploads/covers/${req.file.filename}`
    }

    const playlistId = uuidv4()
    const isPublic = is_public === false || is_public === 'false' || is_public === '0' ? 0 : 1

    db.prepare(`
      INSERT INTO playlists (id, name, description, cover_url, owner_id, is_public)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(playlistId, name.trim(), description || null, coverUrl, req.user!.id, isPublic)

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId)
    return res.status(201).json({ playlist })
  } catch (err: any) {
    console.error('Create playlist error:', err)
    return res.status(500).json({ error: err.message || 'Failed to create playlist.' })
  }
})

// PUT /api/playlists/:id
router.put('/:id', requireAuth, upload.single('cover'), (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const { name, description, is_public } = req.body

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id) as any
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' })
    }
    if (playlist.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this playlist.' })
    }

    const updates: string[] = []
    const params: any[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name.trim())
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (is_public !== undefined) {
      updates.push('is_public = ?')
      params.push(is_public === 'false' || is_public === '0' || is_public === false ? 0 : 1)
    }
    if (req.file) {
      const serverBase = `${req.protocol}://${req.get('host')}`
      updates.push('cover_url = ?')
      params.push(`${serverBase}/uploads/covers/${req.file.filename}`)
    }

    if (updates.length > 0) {
      params.push(id)
      db.prepare(`UPDATE playlists SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }

    const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id)
    return res.json({ playlist: updated })
  } catch (err: any) {
    console.error('Update playlist error:', err)
    return res.status(500).json({ error: err.message || 'Failed to update playlist.' })
  }
})

// DELETE /api/playlists/:id
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id) as any
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' })
    }
    if (playlist.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this playlist.' })
    }

    db.prepare('DELETE FROM playlists WHERE id = ?').run(id)
    return res.json({ success: true, message: 'Playlist deleted.' })
  } catch (err: any) {
    console.error('Delete playlist error:', err)
    return res.status(500).json({ error: err.message || 'Failed to delete playlist.' })
  }
})

// POST /api/playlists/:id/tracks
router.post('/:id/tracks', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const { track_id } = req.body

    if (!track_id) {
      return res.status(400).json({ error: 'track_id is required.' })
    }

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id) as any
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' })
    }
    if (playlist.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to add tracks to this playlist.' })
    }

    // Check if already in playlist
    const existing = db.prepare('SELECT * FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').get(id, track_id)
    if (existing) {
      return res.status(400).json({ error: 'Track is already in this playlist.' })
    }

    const maxPosRow = db.prepare('SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlist_id = ?').get(id) as any
    const nextPosition = (maxPosRow?.maxPos || 0) + 1

    const ptId = uuidv4()
    db.prepare(`
      INSERT INTO playlist_tracks (id, playlist_id, track_id, position)
      VALUES (?, ?, ?, ?)
    `).run(ptId, id, track_id, nextPosition)

    return res.status(201).json({ success: true, message: 'Track added to playlist.' })
  } catch (err: any) {
    console.error('Add track to playlist error:', err)
    return res.status(500).json({ error: err.message || 'Failed to add track to playlist.' })
  }
})

// DELETE /api/playlists/:id/tracks/:trackId
router.delete('/:id/tracks/:trackId', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id, trackId } = req.params

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id) as any
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' })
    }
    if (playlist.owner_id !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this playlist.' })
    }

    db.prepare('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?').run(id, trackId)
    return res.json({ success: true, message: 'Track removed from playlist.' })
  } catch (err: any) {
    console.error('Remove track from playlist error:', err)
    return res.status(500).json({ error: err.message || 'Failed to remove track from playlist.' })
  }
})

export default router
