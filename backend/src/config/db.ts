import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure data directory and upload directories exist
const dataDir = path.resolve(__dirname, '../../data')
const uploadsDir = path.resolve(__dirname, '../../uploads')
const tracksDir = path.join(uploadsDir, 'tracks')
const coversDir = path.join(uploadsDir, 'covers')
const avatarsDir = path.join(uploadsDir, 'avatars')

;[dataDir, uploadsDir, tracksDir, coversDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

const dbPath = path.join(dataDir, 'muse.db')
export const db = new Database(dbPath)

// Enable foreign keys and WAL mode for high concurrency
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      genre TEXT,
      duration_seconds INTEGER DEFAULT 0,
      cover_url TEXT,
      audio_url TEXT NOT NULL,
      uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      play_count INTEGER DEFAULT 0,
      lyrics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id TEXT PRIMARY KEY,
      playlist_id TEXT REFERENCES playlists(id) ON DELETE CASCADE,
      track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playlist_id, track_id)
    );

    CREATE TABLE IF NOT EXISTS liked_tracks (
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
      liked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user_id, track_id)
    );

    CREATE TABLE IF NOT EXISTS play_history (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tracks_play_count ON tracks(play_count DESC);
    CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id, position ASC);
    CREATE INDEX IF NOT EXISTS idx_liked_tracks_user ON liked_tracks(user_id);
    CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id, played_at DESC);
  `)

  // Seed sample initial music tracks if table is completely empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM tracks')
  const { count } = countStmt.get() as { count: number }

  if (count === 0) {
    const seedTracks = [
      {
        id: 'seed-track-1',
        title: 'Midnight Horizons',
        artist: 'Aetheria',
        album: 'Neon Dreams',
        genre: 'Synthwave',
        duration_seconds: 218,
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        audio_url: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
        play_count: 1420,
        lyrics: `[00:00.00] (Synthwave intro begins)
[00:15.00] Gliding through the neon haze
[00:22.00] City lights in violet rays
[00:30.00] The night is young, the pulse is high
[00:38.00] Beneath the digital sky
[00:46.00] Midnight horizons calling me
[00:54.00] Where the synth sets us free`,
      },
      {
        id: 'seed-track-2',
        title: 'Solar Flare',
        artist: 'Pulse Velocity',
        album: 'Cosmic Drift',
        genre: 'Electronic',
        duration_seconds: 194,
        cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        audio_url: 'https://cdn.freesound.org/previews/614/614835_5674468-lq.mp3',
        play_count: 2890,
        lyrics: `[00:00.00] (Bass resonance pulse)
[00:12.00] Charging the core
[00:24.00] Breaking through the atmosphere
[00:36.00] Solar flare igniting here
[00:48.00] Endless energy unwinds`,
      },
      {
        id: 'seed-track-3',
        title: 'Ethereal Echoes',
        artist: 'Lunar Drift',
        album: 'Atmospheres Vol. 1',
        genre: 'Ambient',
        duration_seconds: 265,
        cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        audio_url: 'https://cdn.freesound.org/previews/588/588235_5674468-lq.mp3',
        play_count: 980,
        lyrics: `[00:00.00] (Deep ambient pad resonance)
[00:30.00] Echoes in the quiet space
[01:00.00] Floating without a trace`,
      },
      {
        id: 'seed-track-4',
        title: 'Velocity Rush',
        artist: 'Cyber Pulse',
        album: 'Overdrive',
        genre: 'Cyberpunk',
        duration_seconds: 182,
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        audio_url: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
        play_count: 3410,
        lyrics: `[00:00.00] Faster than light
[00:18.00] Racing into the dark night
[00:35.00] Pure velocity, pure power`,
      }
    ]

    const insertStmt = db.prepare(`
      INSERT INTO tracks (id, title, artist, album, genre, duration_seconds, cover_url, audio_url, play_count, lyrics)
      VALUES (@id, @title, @artist, @album, @genre, @duration_seconds, @cover_url, @audio_url, @play_count, @lyrics)
    `)

    for (const track of seedTracks) {
      insertStmt.run(track)
    }
  }
}
