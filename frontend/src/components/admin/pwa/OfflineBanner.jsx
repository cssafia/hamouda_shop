// src/components/admin/pwa/OfflineBanner.jsx
import { useEffect, useState } from 'react'
import { LuWifiOff } from 'react-icons/lu'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="sticky top-14 z-10 bg-warning/10 border-b border-warning/20 text-warning animate-fade-in"
    >
      <div className="flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium">
        <LuWifiOff size={14} aria-hidden="true" />
        <span>Hors ligne — les modifications ne sont pas enregistrées</span>
      </div>
    </div>
  )
}