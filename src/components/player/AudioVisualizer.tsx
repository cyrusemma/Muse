import React, { useEffect, useRef } from 'react'
import { usePlayerStore, getAudioAnalyser } from '../../store/playerStore'

interface AudioVisualizerProps {
  barCount?: number
  barWidth?: number
  gap?: number
  height?: number
  className?: string
  color?: string
  interactive?: boolean
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  barCount = 32,
  barWidth = 3,
  gap = 2,
  height = 36,
  className = '',
  color = '#7C5CFC',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const totalWidth = barCount * (barWidth + gap) - gap
    canvas.width = totalWidth * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Synthetic wave phase for fallback animated visualization
    let phase = 0
    const analyser = isPlaying ? getAudioAnalyser() : null
    const bufferLength = analyser ? analyser.frequencyBinCount : 0
    const dataArray = analyser ? new Uint8Array(bufferLength) : null

    const render = () => {
      ctx.clearRect(0, 0, totalWidth, height)

      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray)
      }

      for (let i = 0; i < barCount; i++) {
        let barHeightRatio = 0.1

        if (isPlaying) {
          if (analyser && dataArray && dataArray.length > 0) {
            const step = Math.floor(dataArray.length / barCount)
            const val = dataArray[i * step] || 0
            barHeightRatio = Math.max(0.12, val / 255)
          } else {
            // Organic simulated beat frequency when direct Web Audio node isn't available
            const wave1 = Math.sin(phase + i * 0.3) * 0.4
            const wave2 = Math.cos(phase * 1.5 + i * 0.2) * 0.3
            const wave3 = Math.sin(phase * 0.7 + i * 0.5) * 0.2
            barHeightRatio = Math.max(0.12, 0.45 + wave1 + wave2 + wave3)
          }
        } else {
          barHeightRatio = 0.1
        }

        const barH = Math.max(3, barHeightRatio * height)
        const x = i * (barWidth + gap)
        const y = height - barH

        // Create gradient
        const gradient = ctx.createLinearGradient(0, y, 0, height)
        gradient.addColorStop(0, '#A78BFA') // light violet
        gradient.addColorStop(1, color) // deep brand violet

        ctx.fillStyle = gradient
        ctx.beginPath()
        // Rounded bar top
        const radius = Math.min(barWidth / 2, barH / 2)
        ctx.roundRect(x, y, barWidth, barH, [radius, radius, 1, 1])
        ctx.fill()
      }

      phase += 0.08
      animationFrameId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isPlaying, currentTrack, barCount, barWidth, gap, height, color])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{
          width: barCount * (barWidth + gap) - gap,
          height: height,
        }}
        className="block"
      />
    </div>
  )
}
