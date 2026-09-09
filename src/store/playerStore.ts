import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Track } from '../types'

const audio = new Audio()
audio.preload = 'metadata'

interface PlayerStore {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  progress: number
  volume: number
  duration: number
  isShuffled: boolean
  repeatMode: 'off' | 'one' | 'all'
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) set({ progress: audio.currentTime / audio.duration })
  })

  audio.addEventListener('loadedmetadata', () => {
    set({ duration: audio.duration })
  })

  audio.addEventListener('ended', () => {
    const { repeatMode, next } = get()
    if (repeatMode === 'one') {
      audio.currentTime = 0
      audio.play()
    } else {
      next()
    }
  })

  let playCountTimeout: ReturnType<typeof setTimeout> | null = null

  return {
    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    progress: 0,
    volume: 1,
    duration: 0,
    isShuffled: false,
    repeatMode: 'off',

    play: (track, queue = []) => {
      if (playCountTimeout) clearTimeout(playCountTimeout)
      audio.src = track.audio_url
      audio.load()
      audio.play()
      const index = queue.findIndex(t => t.id === track.id)
      set({
        currentTrack: track,
        queue: queue.length > 0 ? queue : [track],
        queueIndex: index >= 0 ? index : 0,
        isPlaying: true,
        progress: 0,
        duration: 0,
      })

      playCountTimeout = setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('play_history').insert({ user_id: user.id, track_id: track.id })
        }
        await supabase.rpc('increment_play_count', { track_id: track.id })
      }, 30000)
    },

    pause: () => {
      audio.pause()
      set({ isPlaying: false })
    },

    resume: () => {
      audio.play()
      set({ isPlaying: true })
    },

    next: () => {
      const { queue, queueIndex, repeatMode } = get()
      if (queue.length === 0) return
      let nextIndex = queueIndex + 1
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0
        else { set({ isPlaying: false }); return }
      }
      get().play(queue[nextIndex], queue)
    },

    prev: () => {
      if (audio.currentTime > 3) { audio.currentTime = 0; return }
      const { queue, queueIndex } = get()
      const prevIndex = Math.max(0, queueIndex - 1)
      get().play(queue[prevIndex], queue)
    },

    seek: (progress) => {
      if (audio.duration) {
        audio.currentTime = progress * audio.duration
        set({ progress })
      }
    },

    setVolume: (volume) => { audio.volume = volume; set({ volume }) },

    toggleShuffle: () => set(state => ({ isShuffled: !state.isShuffled })),

    toggleRepeat: () => set(state => {
      const modes: Array<'off' | 'one' | 'all'> = ['off', 'all', 'one']
      const currentIndex = modes.indexOf(state.repeatMode)
      return { repeatMode: modes[(currentIndex + 1) % modes.length] }
    }),
  }
})
