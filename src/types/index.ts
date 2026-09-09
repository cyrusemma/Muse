export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string | null
  duration_seconds: number | null
  cover_url: string | null
  audio_url: string
  uploaded_by: string | null
  play_count: number
  created_at: string
}

export interface Playlist {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  owner_id: string
  is_public: boolean
  created_at: string
  track_count?: number
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
