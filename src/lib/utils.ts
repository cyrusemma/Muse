export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const trackColor = (id: string): string => {
  const colors = ['#7C5CFC', '#1D9E75', '#E8583C', '#3B8BD4', '#D4537E', '#F2A623']
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}

export const trackColorDark = (id: string): string => {
  const colors = ['#2d1b8e', '#04342C', '#7a1a0a', '#042C53', '#4a0a28', '#7a4a00']
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text
