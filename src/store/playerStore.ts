// Zustand is a state management library.
// Think of it as a global variable store that React
// components can read from and write to.
// When the store updates, only components using that
// piece of state re-render — very efficient.

import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Track } from '../types'

// Create the audio element once, outside React
// It lives for the entire lifetime of the browser tab
const audio = new Audio()
audio.preload = 'metadata'
audio.crossOrigin = 'anonymous'

// Web Audio API Context and Analyser for real-time visualization
let audioCtx: AudioContext | null = null
let analyserNode: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null

export const getAudioAnalyser = (): AnalyserNode | null => {
  if (analyserNode) return analyserNode
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return null

    audioCtx = new AudioContextClass()
    analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize = 128
    analyserNode.smoothingTimeConstant = 0.8

    sourceNode = audioCtx.createMediaElementSource(audio)
    sourceNode.connect(analyserNode)
    analyserNode.connect(audioCtx.destination)
    return analyserNode
  } catch (e) {
    // If CORS or restriction occurs, returns null and fallback animation is used
    return null
  }
}

interface PlayerStore {
  // State
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  progress: number
  volume: number
  previousVolume: number
  isMuted: boolean
  duration: number
  isShuffled: boolean
  repeatMode: 'off' | 'one' | 'all'

  // Modal / Drawer visibility states
  isQueueOpen: boolean
  isLyricsOpen: boolean
  isFullscreenOpen: boolean

  // Actions
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void // 0-1
  seekRelative: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void

  // Queue actions
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void

  // View state setters
  setQueueOpen: (open: boolean) => void
  setLyricsOpen: (open: boolean) => void
  setFullscreenOpen: (open: boolean) => void
  toggleQueue: () => void
  toggleLyrics: () => void
  toggleFullscreen: () => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // Wire up audio element event listeners
  audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      set({ progress: audio.currentTime / audio.duration })
    }
  })

  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
      set({ duration: audio.duration })
    }
  })

  audio.addEventListener('ended', () => {
    const { repeatMode, next } = get()
    if (repeatMode === 'one') {
      audio.currentTime = 0
      audio.play().catch(() => {})
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
    previousVolume: 1,
    isMuted: false,
    duration: 0,
    isShuffled: false,
    repeatMode: 'off',

    isQueueOpen: false,
    isLyricsOpen: false,
    isFullscreenOpen: false,

    play: (track, queue = []) => {
      if (playCountTimeout) clearTimeout(playCountTimeout)

      // Resume AudioContext if suspended
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
      }

      if (track.audio_url) {
        audio.src = track.audio_url
        audio.load()
        audio.play().catch((err) => {
          console.warn('Playback error / Autoplay blocked:', err)
        })
      }

      const currentQueue = queue.length > 0 ? queue : [track]
      const index = currentQueue.findIndex((t) => t.id === track.id)

      set({
        currentTrack: track,
        queue: currentQueue,
        queueIndex: index >= 0 ? index : 0,
        isPlaying: true,
        progress: 0,
        duration: track.duration_seconds || 0,
      })

      playCountTimeout = setTimeout(async () => {
        if (!isSupabaseConfigured) return
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('play_history').insert({
              user_id: user.id,
              track_id: track.id,
            })
          }
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
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
      }
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
          nextIndex = 0
        } else {
          set({ isPlaying: false })
          return
        }
      }

      get().play(queue[nextIndex], queue)
    },

    prev: () => {
      const { queue, queueIndex } = get()

      if (audio.currentTime > 3) {
        audio.currentTime = 0
        set({ progress: 0 })
        return
      }

      const prevIndex = Math.max(0, queueIndex - 1)
      get().play(queue[prevIndex], queue)
    },

    seek: (progress) => {
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = progress * audio.duration
        set({ progress })
      }
    },

    seekRelative: (seconds) => {
      if (audio.duration && !isNaN(audio.duration)) {
        const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds))
        audio.currentTime = newTime
        set({ progress: newTime / audio.duration })
      }
    },

    setVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume))
      audio.volume = clamped
      set({ volume: clamped, isMuted: clamped === 0, previousVolume: clamped > 0 ? clamped : get().previousVolume })
    },

    toggleMute: () => {
      const { isMuted, volume, previousVolume } = get()
      if (isMuted || volume === 0) {
        const restoreVol = previousVolume > 0 ? previousVolume : 0.8
        audio.volume = restoreVol
        set({ volume: restoreVol, isMuted: false })
      } else {
        set({ previousVolume: volume, volume: 0, isMuted: true })
        audio.volume = 0
      }
    },

    toggleShuffle: () => {
      set((state) => ({ isShuffled: !state.isShuffled }))
    },

    toggleRepeat: () => {
      set((state) => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one']
        const currentIndex = modes.indexOf(state.repeatMode)
        return { repeatMode: modes[(currentIndex + 1) % modes.length] }
      })
    },

    addToQueue: (track) => {
      set((state) => ({ queue: [...state.queue, track] }))
    },

    removeFromQueue: (index) => {
      set((state) => {
        const newQueue = [...state.queue]
        newQueue.splice(index, 1)
        let newIndex = state.queueIndex
        if (index < state.queueIndex) {
          newIndex = Math.max(0, state.queueIndex - 1)
        } else if (index === state.queueIndex && index >= newQueue.length) {
          newIndex = Math.max(0, newQueue.length - 1)
        }
        return { queue: newQueue, queueIndex: newIndex }
      })
    },

    reorderQueue: (fromIndex, toIndex) => {
      set((state) => {
        const newQueue = [...state.queue]
        const [movedTrack] = newQueue.splice(fromIndex, 1)
        newQueue.splice(toIndex, 0, movedTrack)

        let newIndex = state.queueIndex
        if (state.queueIndex === fromIndex) {
          newIndex = toIndex
        } else if (fromIndex < state.queueIndex && toIndex >= state.queueIndex) {
          newIndex = state.queueIndex - 1
        } else if (fromIndex > state.queueIndex && toIndex <= state.queueIndex) {
          newIndex = state.queueIndex + 1
        }

        return { queue: newQueue, queueIndex: newIndex }
      })
    },

    clearQueue: () => {
      const { currentTrack } = get()
      set({ queue: currentTrack ? [currentTrack] : [], queueIndex: 0 })
    },

    setQueueOpen: (open) => set({ isQueueOpen: open }),
    setLyricsOpen: (open) => set({ isLyricsOpen: open }),
    setFullscreenOpen: (open) => set({ isFullscreenOpen: open }),

    toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
    toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
    toggleFullscreen: () => set((state) => ({ isFullscreenOpen: !state.isFullscreenOpen })),
  }
})
