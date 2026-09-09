import { Router, Response } from 'express'
import { db } from '../config/db.js'
import { optionalAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/users/:id
router.get('/:id', (req, res): any => {
  try {
    const { id } = req.params

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ? OR username = ?').get(id, id) as any
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found.' })
    }

    const trackCount = db.prepare('SELECT COUNT(*) as count FROM tracks WHERE uploaded_by = ?').get(profile.id) as any
    const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE owner_id = ? AND is_public = 1').get(profile.id) as any

    return res.json({
      profile: {
        ...profile,
        stats: {
          tracks: trackCount?.count || 0,
          playlists: playlistCount?.count || 0,
        },
      },
    })
  } catch (err: any) {
    console.error('Get user profile error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch user profile.' })
  }
})

// GET /api/users/:id/tracks
router.get('/:id/tracks', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.id

    const query = `
      SELECT 
        t.*,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        CASE WHEN l.track_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM tracks t
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      LEFT JOIN liked_tracks l ON t.id = l.track_id AND l.user_id = ?
      WHERE t.uploaded_by = ?
      ORDER BY t.created_at DESC
    `
    const tracks = db.prepare(query).all(currentUserId || '', id)
    return res.json({ tracks })
  } catch (err: any) {
    console.error('Get user tracks error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch user tracks.' })
  }
})

export default router
