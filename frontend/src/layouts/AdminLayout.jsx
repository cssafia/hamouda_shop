// src/components/admin/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import TopBar from '../components/admin/TopBar'
import BottomNav from '../components/admin/BottomNav'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <Sidebar />

      {/* Offset for the sidebar on desktop */}
      <div className="lg:pl-64">
        <TopBar />
        <main className="px-4 py-5 lg:px-8 lg:py-8 pb-24 lg:pb-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile-only */}
      <BottomNav />
    </div>
  )
}