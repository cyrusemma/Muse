import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'

export const useKeyboardShortcuts = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const pause = usePlayerStore((state) => state.pause)
  const resume = usePlayerStore((state) => state.resume)
  const next = usePlayerStore((state) => state.next)
  const prev = usePlayerStore((state) => state.prev)
  const seekRelative = usePlayerStore((state) => state.seekRelative)
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const toggleMute = usePlayerStore((state) => state.toggleMute)
  const toggleQueue = usePlayerStore((state) => state.toggleQueue)
  const toggleLyrics = usePlayerStore((state) => state.toggleLyrics)
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing inside inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (!currentTrack) return
          if (isPlaying) {
            pause()
          } else {
            resume()
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          seekRelative(5)
          break

        case 'ArrowLeft':
          e.preventDefault()
          seekRelative(-5)
          break

        case 'ArrowUp':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.05))
          break

        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.05))
          break

        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break

        case 'KeyQ':
          e.preventDefault()
          toggleQueue()
          break

        case 'KeyL':
          e.preventDefault()
          toggleLyrics()
          break

        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break

        case 'KeyN':
          e.preventDefault()
          next()
          break

        case 'KeyP':
          e.preventDefault()
          prev()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    isPlaying,
    currentTrack,
    pause,
    resume,
    next,
    prev,
    seekRelative,
    volume,
    setVolume,
    toggleMute,
    toggleQueue,
    toggleLyrics,
    toggleFullscreen,
  ])
}
