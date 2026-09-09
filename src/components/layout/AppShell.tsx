import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'

export default function AppShell() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gridTemplateRows: '1fr 80px', height: '100vh', overflow: 'hidden', background: '#0F0F0F' }}>
      <Sidebar />
      <main style={{ overflowY: 'auto', padding: '24px 28px', gridColumn: '2', gridRow: '1' }}>
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  )
}
