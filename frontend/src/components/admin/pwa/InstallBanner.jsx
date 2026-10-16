// src/components/admin/pwa/InstallBanner.jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  LuDownload, LuShare, LuPlus, LuX, LuEllipsisVertical,
} from 'react-icons/lu'

import { usePWA } from '../../../features/pwa/usePWA'

export default function InstallBanner() {
  const { shouldShow, isIos, triggerInstall, dismiss } = usePWA()
  const [iosSheetOpen, setIosSheetOpen] = useState(false)

  if (!shouldShow) return null

  const onPrimaryClick = async () => {
    if (isIos) {
      setIosSheetOpen(true)
      return
    }
    const result = await triggerInstall()
    // If the user dismissed the native prompt, hide the banner too
    if (result?.outcome === 'dismissed') dismiss()
  }

  return (
    <>
      <div
        role="region"
        aria-label="Installer l'application"
        className="fixed inset-x-3 bottom-20 lg:bottom-4 lg:left-auto lg:right-4 lg:w-96 z-[60] animate-fade-in"
      >
        <div className="card p-4 flex items-start gap-3">
          <span
            aria-hidden="true"
            className="shrink-0 w-10 h-10 rounded-control bg-brand-50 text-brand-600 flex items-center justify-center"
          >
            <LuDownload size={18} />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-900">
              Installe l'app Admin
            </p>
            <p className="text-xs text-ink-600 mt-0.5">
              Accès rapide depuis ton écran d'accueil.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="text-xs font-medium text-ink-600 hover:text-ink-900 px-2 py-1.5 rounded-control transition-colors"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={onPrimaryClick}
                className="text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded-control transition-colors"
              >
                {isIos ? 'Comment ?' : 'Installer'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Fermer"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-surface-subtle hover:text-ink-700 transition-colors"
          >
            <LuX size={14} />
          </button>
        </div>
      </div>

      {iosSheetOpen && (
        <IosInstructionsSheet onClose={() => setIosSheetOpen(false)} />
      )}
    </>
  )
}

/* ---------- iOS step-by-step sheet ---------- */

function IosInstructionsSheet({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={onClose}
      />

      <div className="relative card w-full max-w-md p-5 space-y-5 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink-900">
              Ajouter à l'écran d'accueil
            </h3>
            <p className="text-sm text-ink-600 mt-0.5">
              3 étapes rapides.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-surface-subtle hover:text-ink-700"
          >
            <LuX size={16} />
          </button>
        </div>

        <ol className="space-y-4">
          <Step
            index={1}
            icon={LuShare}
            title="Appuie sur Partager"
            hint="Bouton en bas de Safari (carré avec flèche ↑)"
          />
          <Step
            index={2}
            icon={LuPlus}
            title="Choisis « Sur l'écran d'accueil »"
            hint="Fais défiler si tu ne le vois pas tout de suite"
          />
          <Step
            index={3}
            icon={LuEllipsisVertical}
            title="Appuie sur Ajouter"
            hint="En haut à droite"
          />
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full"
        >
          Compris
        </button>
      </div>
    </div>,
    document.body
  )
}

function Step({ index, icon: Icon, title, hint }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold"
      >
        {index}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
          <Icon size={14} className="text-ink-400 shrink-0" />
          {title}
        </p>
        <p className="text-xs text-ink-600 mt-0.5">{hint}</p>
      </div>
    </li>
  )
}