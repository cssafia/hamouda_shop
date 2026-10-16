// src/pages/auth/ChangePassword.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Alert from '../../components/ui/Alert.jsx'
import { useChangePassword } from '../../features/auth/useAuth.js'
import { SHOP_NAME } from '../../constants/config.js'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mismatchError, setMismatchError] = useState('')

  const navigate = useNavigate()
  const changePassword = useChangePassword()

  function handleSubmit(e) {
    e.preventDefault()
    setMismatchError('')

    if (password !== confirmPassword) {
      setMismatchError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password === currentPassword) {
      setMismatchError('Le nouveau mot de passe doit être différent de l\'actuel.')
      return
    }

    changePassword.mutate(
      { current_password: currentPassword, new_password: password },
      { onSuccess: () => navigate('/admin/dashboard', { replace: true }) }
    )
  }

  return (
    <div className="card p-6 sm:p-7 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-11 w-11 rounded-control bg-brand-500 text-white grid place-items-center font-semibold shadow-sm">
          {SHOP_NAME?.[0]?.toUpperCase() ?? 'S'}
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
          Changer le mot de passe
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Choisissez un mot de passe sécurisé (8 caractères min.).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="currentPassword"
          type="password"
          label="Mot de passe actuel"
          placeholder="••••••••"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <Input
          id="password"
          type="password"
          label="Nouveau mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />

        {mismatchError && (
          <Alert variant="error">{mismatchError}</Alert>
        )}

        {changePassword.isError && (
          <Alert variant="error">
            {changePassword.error?.message ?? 'Échec de la mise à jour.'}
          </Alert>
        )}

        <Button
          type="submit"
          loading={changePassword.isPending}
          className="w-full"
        >
          Enregistrer le mot de passe
        </Button>

        <Link
          to="/admin/dashboard"
          className="block text-sm font-medium text-brand-600 hover:text-brand-700 text-center"
        >
          ← Retour au tableau de bord
        </Link>
      </form>
    </div>
  )
}