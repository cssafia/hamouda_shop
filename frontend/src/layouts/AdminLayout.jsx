// src/layouts/AdminLayout.jsx
import { Outlet } from 'react-router-dom'

import Sidebar from '../components/admin/Sidebar'
import TopBar from '../components/admin/TopBar'
import BottomNav from '../components/admin/BottomNav'
import InstallBanner from '../components/admin/pwa/InstallBanner'
import OfflineBanner from '../components/admin/pwa/OfflineBanner'
import { usePWAManifest } from '../features/pwa/usePWAManifest'

export default function AdminLayout() {
  usePWAManifest()          // ← adds/removes manifest link per route

  return (
    <div className="min-h-screen bg-surface-subtle">
      <Sidebar />

      <div className="lg:pl-64">
        <TopBar />
        <OfflineBanner />   {/* ← sits between TopBar and main */}
        <main className="px-4 py-5 lg:px-8 lg:py-8 pb-24 lg:pb-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <InstallBanner />
    </div>
  )
}