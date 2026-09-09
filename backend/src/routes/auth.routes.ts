import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../config/db.js'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'muse_super_secret_jwt_key_2025_change_in_production'

// POST /api/auth/register
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { email, password, username, displayName } = req.body

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    // Check if email or username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' })
    }

    const existingUsername = db.prepare('SELECT id FROM profiles WHERE username = ?').get(username.toLowerCase())
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' })
    }

    const userId = uuidv4()
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
    `)

    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, username, display_name)
      VALUES (?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      insertUser.run(userId, email.toLowerCase(), passwordHash)
      insertProfile.run(userId, username.toLowerCase(), displayName || username)
    })

    transaction()

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), username: username.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId)

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        ...profile as object,
      },
    })
  } catch (err: any) {
    console.error('Register error:', err)
    return res.status(500).json({ error: err.message || 'Registration failed.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(user.id) as any

    const token = jwt.sign(
      { id: user.id, email: user.email, username: profile?.username || 'user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return res.status(500).json({ error: err.message || 'Login failed.' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response): any => {
  try {
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user!.id) as any
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user!.id) as any

    return res.json({
      user: {
        ...user,
        ...profile,
      },
    })
  } catch (err: any) {
    console.error('Me error:', err)
    return res.status(500).json({ error: err.message || 'Failed to get current user.' })
  }
})

// PUT /api/auth/profile
router.put('/profile', requireAuth, upload.single('avatar'), (req: AuthRequest, res: Response): any => {
  try {
    const { displayName, bio } = req.body
    let avatarUrl = undefined

    if (req.file) {
      const serverBase = `${req.protocol}://${req.get('host')}`
      avatarUrl = `${serverBase}/uploads/avatars/${req.file.filename}`
    }

    const updates: string[] = []
    const params: any[] = []

    if (displayName !== undefined) {
      updates.push('display_name = ?')
      params.push(displayName)
    }
    if (bio !== undefined) {
      updates.push('bio = ?')
      params.push(bio)
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?')
      params.push(avatarUrl)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      params.push(req.user!.id)
      db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...params)
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user!.id)
    return res.json({ profile })
  } catch (err: any) {
    console.error('Profile update error:', err)
    return res.status(500).json({ error: err.message || 'Failed to update profile.' })
  }
})

export default router
