import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'
import { QueueDrawer } from '../player/QueueDrawer'
import { LyricsDrawer } from '../player/LyricsDrawer'
import { FullscreenPlayer } from '../player/FullscreenPlayer'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

export default function AppShell() {
  // Activate global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gridTemplateRows: '1fr 80px',
        height: '100vh',
        overflow: 'hidden',
        background: '#0F0F0F',
      }}
      className="relative select-none"
    >
      {/* Sidebar: column 1, rows 1 */}
      <Sidebar />

      {/* Main scrollable content: column 2, row 1 */}
      <main
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '28px 32px',
          gridColumn: '2',
          gridRow: '1',
          scrollBehavior: 'smooth',
        }}
      >
        <Outlet />
      </main>

      {/* Player bar: spans both columns, row 2 */}
      <PlayerBar />

      {/* Global Overlays & Modals */}
      <QueueDrawer />
      <LyricsDrawer />
      <FullscreenPlayer />
    </div>
  )
}
