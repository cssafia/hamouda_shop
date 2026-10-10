// src/pages/auth/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useResetPassword } from '../../features/auth/useAuth.js';
import { SHOP_NAME } from '../../constants/config.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mismatchError, setMismatchError] = useState('');
  const navigate = useNavigate();
  const resetPassword = useResetPassword();

  function handleSubmit(e) {
    e.preventDefault();
    setMismatchError('');

    if (password !== confirmPassword) {
      setMismatchError('Les mots de passe ne correspondent pas.');
      return;
    }

    resetPassword.mutate(
      { token, password },
      { onSuccess: () => navigate('/auth/login', { replace: true }) }
    );
  }

  /* ---------- Invalid token state ---------- */
  if (!token) {
    return (
      <div className="card p-6 sm:p-7 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-11 w-11 rounded-control bg-brand-500 text-white grid place-items-center font-semibold shadow-sm">
            {SHOP_NAME?.[0]?.toUpperCase() ?? 'S'}
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
            Lien invalide
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Ce lien de réinitialisation est invalide ou incomplet.
          </p>
        </div>

        <Alert variant="warning">Demandez un nouveau lien pour continuer.</Alert>

        <Link
          to="/auth/forgot-password"
          className="mt-5 block text-sm font-medium text-brand-600 hover:text-brand-700 text-center"
        >
          Redemander un lien →
        </Link>
      </div>
    );
  }

  /* ---------- Form state ---------- */
  return (
    <div className="card p-6 sm:p-7 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-11 w-11 rounded-control bg-brand-500 text-white grid place-items-center font-semibold shadow-sm">
          {SHOP_NAME?.[0]?.toUpperCase() ?? 'S'}
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Choisissez un mot de passe sécurisé (8 caractères min.).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="password" type="password" label="Nouveau mot de passe"
          placeholder="••••••••" autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          required minLength={8}
        />
        <Input
          id="confirmPassword" type="password" label="Confirmer le mot de passe"
          placeholder="••••••••" autoComplete="new-password"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          required minLength={8}
        />

        {mismatchError && (
          <Alert variant="error">{mismatchError}</Alert>
        )}

        {resetPassword.isError && (
          <Alert variant="error">
            {resetPassword.error?.message
              ?? 'Le lien a expiré ou est invalide. Redemandez un lien.'}
          </Alert>
        )}

        <Button
          type="submit"
          loading={resetPassword.isPending}
          className="w-full"
        >
          Réinitialiser le mot de passe
        </Button>

        <Link
          to="/auth/login"
          className="block text-sm font-medium text-brand-600 hover:text-brand-700 text-center"
        >
          ← Retour à la connexion
        </Link>
      </form>
    </div>
  );
}