import { useState } from 'react'

interface CoverArtProps {
  src?: string | null
  trackId: string
  size?: number
  borderRadius?: number
  className?: string
}

// Fixed color palettes derived from trackId
const PALETTE_A = ['#7C5CFC', '#1D9E75', '#E8583C', '#3B8BD4', '#D4537E', '#F2A623']
const PALETTE_B = ['#3B1FA8', '#04342C', '#7a1a0a', '#042C53', '#4a0a28', '#7a4a00']

function hashChar(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0
  return n
}

export default function CoverArt({ src, trackId, size = 64, borderRadius = 5, className = '' }: CoverArtProps) {
  const [imgError, setImgError] = useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt="cover"
        onError={() => setImgError(true)}
        style={{ width: size, height: size, minWidth: size, minHeight: size, borderRadius, objectFit: 'cover', display: 'block' }}
        className={className}
      />
    )
  }

  const idx = hashChar(trackId || 'x') % PALETTE_A.length
  const bg = `linear-gradient(145deg, ${PALETTE_A[idx]}, ${PALETTE_B[idx]})`

  return (
    <div
      className={`flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size, borderRadius, background: bg }}
    >
      {/* Music note icon */}
      <svg
        viewBox="0 0 24 24"
        fill="rgba(255,255,255,0.35)"
        style={{ width: size * 0.38, height: size * 0.38 }}
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    </div>
  )
}
