export function getJson<T = any>(key: string, fallback: T | null = null): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn('getJson parse error for key', key, err)
    return fallback
  }
}

export function setJson<T = any>(key: string, value: T | null) {
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch (err) {
    console.warn('setJson error for key', key, err)
  }
}
