// Zustand is a state management library.
// Think of it as a global variable store that React
// components can read from and write to.
// When the store updates, only components using that
// piece of state re-render — very efficient.

// The key insight: we create ONE Audio element here
// at the module level, outside of React entirely.
// React components come and go as you navigate pages,
// but this audio element never gets destroyed.
// That's what makes music keep playing between pages.

import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Track } from '../types'

// Create the audio element once, outside React
// It lives for the entire lifetime of the browser tab
const audio = new Audio()
audio.preload = 'metadata'

interface PlayerStore {
  // State — what's currently happening
  currentTrack: Track | null      // the track that's loaded
  queue: Track[]                  // all tracks available to play next
  queueIndex: number              // position in the queue
  isPlaying: boolean              // is audio actually playing right now
  progress: number                // 0 to 1 — how far through the track
  volume: number                  // 0 to 1
  duration: number                // total seconds of current track
  isShuffled: boolean
  repeatMode: 'off' | 'one' | 'all'

  // Actions — things you can do
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void   // progress is 0–1
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Wire up audio element event listeners
  // These fire automatically as the audio plays

  // timeupdate fires ~4 times per second while playing
  // We use it to update the progress bar
  audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      set({ progress: audio.currentTime / audio.duration })
    }
  })

  // loadedmetadata fires when the audio file is ready
  // This is when we know the total duration
  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      set({ duration: audio.duration })
    }
  })

  // ended fires when the track finishes
  // We auto-advance to the next track
  audio.addEventListener('ended', () => {
    const { repeatMode, next } = get()
    if (repeatMode === 'one') {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      next()
    }
  })

  // Track the play count timeout
  // We only count a play after 30 seconds to avoid spam
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
      // Clear any pending play count log
      if (playCountTimeout) clearTimeout(playCountTimeout)

      // Load the new track into the audio element
      if (track.audio_url) {
        audio.src = track.audio_url
        audio.load()
        audio.play().catch((err) => {
          console.warn('Playback error / Autoplay blocked:', err)
        })
      }

      // Find the index of this track in the queue
      const currentQueue = queue.length > 0 ? queue : [track]
      const index = currentQueue.findIndex(t => t.id === track.id)

      set({
        currentTrack: track,
        queue: currentQueue,
        queueIndex: index >= 0 ? index : 0,
        isPlaying: true,
        progress: 0,
        duration: track.duration_seconds || 0,
      })

      // Log the play and increment count after 30 seconds
      // If user skips before 30s, this gets cancelled
      playCountTimeout = setTimeout(async () => {
        if (!isSupabaseConfigured) return
        try {
          // Log to play history (only if user is logged in)
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('play_history').insert({
              user_id: user.id,
              track_id: track.id,
            })
          }
          // Increment play count for everyone
          await supabase.rpc('increment_play_count', {
            track_id: track.id,
          })
        } catch (e) {
          console.warn('Failed to record play count / history:', e)
        }
      }, 30000)
    },

    pause: () => {
      audio.pause()
      set({ isPlaying: false })
    },

    resume: () => {
      if (audio.src) {
        audio.play().catch((err) => console.warn('Resume failed:', err))
      }
      set({ isPlaying: true })
    },

    next: () => {
      const { queue, queueIndex, repeatMode, isShuffled } = get()
      if (queue.length === 0) return

      let nextIndex = queueIndex + 1

      if (isShuffled && queue.length > 1) {
        let randomIndex = Math.floor(Math.random() * queue.length)
        while (randomIndex === queueIndex && queue.length > 1) {
          randomIndex = Math.floor(Math.random() * queue.length)
        }
        nextIndex = randomIndex
      } else if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0 // loop back to start
        } else {
          // End of queue, stop playing
          set({ isPlaying: false })
          return
        }
      }

      get().play(queue[nextIndex], queue)
    },

    prev: () => {
      const { queue, queueIndex } = get()

      // If more than 3 seconds in, restart current track
      // If less than 3 seconds, go to previous track
      if (audio.currentTime > 3) {
        audio.currentTime = 0
        set({ progress: 0 })
        return
      }

      const prevIndex = Math.max(0, queueIndex - 1)
      get().play(queue[prevIndex], queue)
    },

    seek: (progress) => {
      // progress is 0–1, convert to seconds
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = progress * audio.duration
        set({ progress })
      }
    },

    setVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume))
      audio.volume = clamped
      set({ volume: clamped })
    },

    toggleShuffle: () => {
      set(state => ({ isShuffled: !state.isShuffled }))
    },

    toggleRepeat: () => {
      set(state => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one']
        const currentIndex = modes.indexOf(state.repeatMode)
        return { repeatMode: modes[(currentIndex + 1) % modes.length] }
      })
    },
  }
})
