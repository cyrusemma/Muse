const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('muse_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = 'Request failed'
    try {
      const errJson = await response.json()
      errorMessage = errJson.error || response.statusText
    } catch {
      errorMessage = response.statusText
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  // Authentication
  auth: {
    register: (data: { email: string; password: string; username: string; displayName?: string }) =>
      request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),

    me: () => request<{ user: any }>('/auth/me'),

    updateProfile: (formData: FormData) =>
      request<{ profile: any }>('/auth/profile', {
        method: 'PUT',
        body: formData,
      }),
  },

  // Tracks
  tracks: {
    getAll: (params?: { search?: string; genre?: string; sort?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.genre) searchParams.append('genre', params.genre)
      if (params?.sort) searchParams.append('sort', params.sort)
      const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
      return request<{ tracks: any[] }>(`/tracks${query}`)
    },

    getById: (id: string) => request<{ track: any }>(`/tracks/${id}`),

    upload: (formData: FormData) =>
      request<{ track: any }>('/tracks/upload', {
        method: 'POST',
        body: formData,
      }),

    recordPlay: (id: string) =>
      request<{ success: boolean }>(`/tracks/${id}/play`, {
        method: 'POST',
      }),

    toggleLike: (id: string) =>
      request<{ is_liked: boolean }>(`/tracks/${id}/like`, {
        method: 'POST',
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/tracks/${id}`, {
        method: 'DELETE',
      }),
  },

  // Playlists
  playlists: {
    getAll: () => request<{ playlists: any[] }>('/playlists'),

    getById: (id: string) => request<{ playlist: any }>(`/playlists/${id}`),

    create: (formData: FormData) =>
      request<{ playlist: any }>('/playlists', {
        method: 'POST',
        body: formData,
      }),

    update: (id: string, formData: FormData) =>
      request<{ playlist: any }>(`/playlists/${id}`, {
        method: 'PUT',
        body: formData,
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/playlists/${id}`, {
        method: 'DELETE',
      }),

    addTrack: (playlistId: string, trackId: string) =>
      request<{ success: boolean }>(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_id: trackId }),
      }),

    removeTrack: (playlistId: string, trackId: string) =>
      request<{ success: boolean }>(`/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
      }),
  },

  // Library & History
  library: {
    getLiked: () => request<{ tracks: any[] }>('/library/liked'),
    getHistory: () => request<{ tracks: any[] }>('/library/history'),
    getUploads: () => request<{ tracks: any[] }>('/library/uploads'),
  },

  // Users
  users: {
    getProfile: (id: string) => request<{ profile: any }>(`/users/${id}`),
    getTracks: (id: string) => request<{ tracks: any[] }>(`/users/${id}/tracks`),
  },
}
