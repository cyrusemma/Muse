import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './config/db.js'

import authRoutes from './routes/auth.routes.js'
import trackRoutes from './routes/track.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import libraryRoutes from './routes/library.routes.js'
import userRoutes from './routes/user.routes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Initialize SQLite Database and Tables
initDatabase()

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Static file serving for uploads (audio & covers) with Range support for streaming
const uploadsDir = path.resolve(__dirname, '../uploads')
app.use(
  '/uploads',
  express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Accept-Ranges', 'bytes')
      if (filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg')
      }
    },
  })
)

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/tracks', trackRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/users', userRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), service: 'Muse Custom Backend' })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`🎵 Muse Backend Server running on http://localhost:${PORT}`)
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`)
})
