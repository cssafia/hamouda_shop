// src/components/admin/ProfileMenu.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuLogOut, LuKeyRound, LuChevronDown } from 'react-icons/lu'

import { useAuthStore } from '../../features/auth/useAuthStore'
import { useLogout } from '../../features/auth/useAuth'
import ConfirmDialog from '../ui/ConfirmDialog'

function initials(name) {
  if (!name) return 'A'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

export default function ProfileMenu() {
  const admin = useAuthStore((s) => s.admin)
  const logout = useLogout()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const ref = useRef(null)

  /* Close on outside click + Escape */
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleChangePasswordClick = () => {
    setOpen(false)
    navigate('/auth/change-password')
  }

  const handleLogoutClick = () => {
    setOpen(false)
    setConfirmOpen(true)
  }

  const confirmLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => setConfirmOpen(false),
    })
  }

  const label = initials(admin?.name)

  return (
    <>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-1.5 rounded-full pl-0.5 pr-1.5 py-0.5 hover:bg-surface-subtle transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center select-none">
            {label}
          </span>
          <LuChevronDown
            size={14}
            className={`text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-60 rounded-card border border-surface-border bg-white shadow-card overflow-hidden animate-fade-in"
          >
            <div className="px-4 py-3 border-b border-surface-border">
              <p className="text-sm font-medium text-ink-900 truncate">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-ink-600 truncate mt-0.5">
                {admin?.email || '—'}
              </p>
            </div>

            <div className="p-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleChangePasswordClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-sm font-medium text-ink-700 hover:bg-surface-subtle transition-colors"
              >
                <LuKeyRound size={15} className="text-ink-400" />
                Changer le mot de passe
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
              >
                <LuLogOut size={15} />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !logout.isPending && setConfirmOpen(false)}
        onConfirm={confirmLogout}
        title="Se déconnecter ?"
        description="Tu devras te reconnecter pour accéder à l'administration."
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        variant="danger"
        loading={logout.isPending}
      />
    </>
  )
}