import { Router, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../config/db.js'
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()

// GET /api/tracks
router.get('/', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { search, genre, sort, limit = 50, offset = 0 } = req.query
    const currentUserId = req.user?.id

    let query = `
      SELECT 
        t.*,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        p.avatar_url as uploader_avatar_url,
        CASE WHEN l.track_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM tracks t
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      LEFT JOIN liked_tracks l ON t.id = l.track_id AND l.user_id = ?
      WHERE 1=1
    `
    const params: any[] = [currentUserId || '']

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` AND (t.title LIKE ? OR t.artist LIKE ? OR t.album LIKE ? OR t.genre LIKE ?)`
      const term = `%${search.trim()}%`
      params.push(term, term, term, term)
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      query += ` AND LOWER(t.genre) = LOWER(?)`
      params.push(genre)
    }

    if (sort === 'trending') {
      query += ` ORDER BY t.play_count DESC, t.created_at DESC`
    } else if (sort === 'oldest') {
      query += ` ORDER BY t.created_at ASC`
    } else {
      query += ` ORDER BY t.created_at DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(Number(limit), Number(offset))

    const tracks = db.prepare(query).all(...params)
    return res.json({ tracks })
  } catch (err: any) {
    console.error('Get tracks error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch tracks.' })
  }
})

// GET /api/tracks/:id
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.id

    const query = `
      SELECT 
        t.*,
        p.username as uploader_username,
        p.display_name as uploader_display_name,
        p.avatar_url as uploader_avatar_url,
        CASE WHEN l.track_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
      FROM tracks t
      LEFT JOIN profiles p ON t.uploaded_by = p.id
      LEFT JOIN liked_tracks l ON t.id = l.track_id AND l.user_id = ?
      WHERE t.id = ?
    `
    const track = db.prepare(query).get(currentUserId || '', id)

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' })
    }

    return res.json({ track })
  } catch (err: any) {
    console.error('Get track error:', err)
    return res.status(500).json({ error: err.message || 'Failed to fetch track.' })
  }
})

// POST /api/tracks/upload
router.post(
  '/upload',
  requireAuth,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      if (!files || !files.audio || files.audio.length === 0) {
        return res.status(400).json({ error: 'Audio file is required.' })
      }

      const { title, artist, album, genre, duration_seconds, lyrics } = req.body
      if (!title || !artist) {
        return res.status(400).json({ error: 'Title and artist are required.' })
      }

      const serverBase = `${req.protocol}://${req.get('host')}`
      const audioUrl = `${serverBase}/uploads/tracks/${files.audio[0].filename}`
      let coverUrl: string | null = null

      if (files.cover && files.cover.length > 0) {
        coverUrl = `${serverBase}/uploads/covers/${files.cover[0].filename}`
      }

      const trackId = uuidv4()
      const duration = duration_seconds ? parseInt(duration_seconds, 10) : 0

      const stmt = db.prepare(`
        INSERT INTO tracks (
          id, title, artist, album, genre, duration_seconds, 
          cover_url, audio_url, uploaded_by, lyrics
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `)

      stmt.run(
        trackId,
        title,
        artist,
        album || null,
        genre || 'Electronic',
        duration,
        coverUrl,
        audioUrl,
        req.user!.id,
        lyrics || null
      )

      const newTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId)
      return res.status(201).json({ track: newTrack })
    } catch (err: any) {
      console.error('Upload track error:', err)
      return res.status(500).json({ error: err.message || 'Failed to upload track.' })
    }
  }
)

// POST /api/tracks/:id/play
router.post('/:id/play', optionalAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    db.prepare('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?').run(id)

    if (userId) {
      const historyId = uuidv4()
      db.prepare(`
        INSERT INTO play_history (id, user_id, track_id)
        VALUES (?, ?, ?)
      `).run(historyId, userId, id)
    }

    return res.json({ success: true })
  } catch (err: any) {
    console.error('Track play error:', err)
    return res.status(500).json({ error: err.message || 'Failed to record play.' })
  }
})

// POST /api/tracks/:id/like
router.post('/:id/like', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const existing = db.prepare('SELECT * FROM liked_tracks WHERE user_id = ? AND track_id = ?').get(userId, id)

    if (existing) {
      db.prepare('DELETE FROM liked_tracks WHERE user_id = ? AND track_id = ?').run(userId, id)
      return res.json({ is_liked: false })
    } else {
      db.prepare('INSERT INTO liked_tracks (user_id, track_id) VALUES (?, ?)').run(userId, id)
      return res.json({ is_liked: true })
    }
  } catch (err: any) {
    console.error('Toggle like error:', err)
    return res.status(500).json({ error: err.message || 'Failed to toggle like.' })
  }
})

// DELETE /api/tracks/:id
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id) as any
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' })
    }

    if (track.uploaded_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this track.' })
    }

    db.prepare('DELETE FROM tracks WHERE id = ?').run(id)
    return res.json({ success: true, message: 'Track deleted successfully.' })
  } catch (err: any) {
    console.error('Delete track error:', err)
    return res.status(500).json({ error: err.message || 'Failed to delete track.' })
  }
})

export default router
