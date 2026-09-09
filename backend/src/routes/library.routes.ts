import { Router, Response } from 'express'
import { db } from '../config/db.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/library/liked
router.get('/liked', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id

    const query = `
      SELECT 
        t.*,
        l.liked_at,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        1 as is_liked
      FROM liked_tracks l
      JOIN tracks t ON l.track_id = t.id
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      WHERE l.user_id = ?
      ORDER BY l.liked_at DESC
    `
    const tracks = db.prepare(query).all(userId)
    return res.json({ tracks })
  } catch (err: any) {
    console.error('Get liked tracks error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch liked tracks.' })
  }
})

// GET /api/library/history
router.get('/history', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id

    const query = `
      SELECT 
        t.*,
        h.played_at,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        CASE WHEN l.track_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM play_history h
      JOIN tracks t ON h.track_id = t.id
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      LEFT JOIN liked_tracks l ON t.id = l.track_id AND l.user_id = ?
      WHERE h.user_id = ?
      ORDER BY h.played_at DESC
      LIMIT 50
    `
    const tracks = db.prepare(query).all(userId, userId)
    return res.json({ tracks })
  } catch (err: any) {
    console.error('Get play history error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch play history.' })
  }
})

// GET /api/library/uploads
router.get('/uploads', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id

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
    const tracks = db.prepare(query).all(userId, userId)
    return res.json({ tracks })
  } catch (err: any) {
    console.error('Get user uploads error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch user uploads.' })
  }
})

export default router
