import React from 'react'

export default function PlaylistCard({ name, coverA, coverB }: { name: string; coverA: string; coverB: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 8, background: `linear-gradient(135deg, ${coverA}, ${coverB})` }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>5 songs • 15 min</div>
      </div>
    </div>
  )
}
