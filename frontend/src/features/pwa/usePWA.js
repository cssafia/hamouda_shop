// src/features/pwa/usePWA.js
import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed-v1'

function detectIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIpadOS =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || isIpadOS
}

function detectStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  )
}

function detectMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(detectStandalone)
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' &&
          localStorage.getItem(DISMISSED_KEY) === '1'
  )

  const isIos = detectIos()
  const isMobile = detectMobile()

  /* Capture the Android install prompt */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  /* Detect when the app is installed and hide the banner */
  useEffect(() => {
    const handler = () => setIsInstalled(true)
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return { outcome: 'unavailable' }
    installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null)
      setIsInstalled(true)
    }
    return choice
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

    /**
   * Show the banner when:
   *  - on an admin route
   *  - on mobile
   *  - not already installed
   *  - not dismissed
   *  - either iOS (manual install) OR Android with prompt available
   */
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin')

  const shouldShow =
    isAdminRoute &&
    isMobile &&
    !isInstalled &&
    !dismissed &&
    (isIos || !!installPrompt)

  return {
    isIos,
    isMobile,
    isInstalled,
    shouldShow,
    triggerInstall,
    dismiss,
  }
}