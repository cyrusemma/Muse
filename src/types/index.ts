export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio?: string | null
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  username?: string
  display_name?: string | null
  avatar_url?: string | null
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string | null
  genre?: string | null
  duration_seconds: number | null
  cover_url: string | null
  audio_url: string
  uploaded_by: string | null
  uploader_username?: string
  uploader_display_name?: string
  play_count: number
  lyrics?: string | null
  is_liked?: boolean | number
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  owner_id: string
  owner_username?: string
  owner_display_name?: string
  is_public: boolean | number
  created_at: string
  track_count?: number
  tracks?: Track[]
}

export interface PlaylistTrack {
  id: string
  playlist_id: string
  track_id: string
  position: number
  added_at: string
  track?: Track
}

export interface LikedTrack {
  user_id: string
  track_id: string
  liked_at: string
  track?: Track
}
