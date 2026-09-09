import React from 'react'
import { trackColor, trackColorDark } from '../../lib/utils'

interface CoverArtProps {
  src?: string | null
  trackId: string
  size?: number
  borderRadius?: number
}

export default function CoverArt({ src, trackId, size = 64, borderRadius = 6 }: CoverArtProps) {
  if (src) return <img src={src} alt="cover" style={{ width: size, height: size, borderRadius }} />

  const bg = `linear-gradient(135deg, ${trackColor(trackId)}, ${trackColorDark(trackId)})`
  return <div style={{ width: size, height: size, borderRadius, background: bg }} />
}
