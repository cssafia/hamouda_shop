// src/features/pwa/usePWAManifest.js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const LINK_ID = 'admin-pwa-manifest'

export function usePWAManifest() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isAdmin = pathname.startsWith('/admin')
    const existing = document.getElementById(LINK_ID)

    if (isAdmin && !existing) {
      const link = document.createElement('link')
      link.id = LINK_ID
      link.rel = 'manifest'
      link.href = '/manifest.webmanifest'
      document.head.appendChild(link)
    }

    if (!isAdmin && existing) {
      existing.remove()
    }

    return () => {
      // Cleanup when the hook unmounts (admin → outside)
      const current = document.getElementById(LINK_ID)
      if (current && !window.location.pathname.startsWith('/admin')) {
        current.remove()
      }
    }
  }, [pathname])
}