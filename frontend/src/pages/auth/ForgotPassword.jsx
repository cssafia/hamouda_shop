// src/pages/auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useForgotPassword } from '../../features/auth/useAuth.js';
import { SHOP_NAME } from '../../constants/config.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  function handleSubmit(e) {
    e.preventDefault();
    forgotPassword.mutate({ email });
  }

  /* ---------- Success state ---------- */
  if (forgotPassword.isSuccess) {
    return (
      <div className="card p-6 sm:p-7 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-11 w-11 rounded-control bg-brand-500 text-white grid place-items-center font-semibold shadow-sm">
            {SHOP_NAME?.[0]?.toUpperCase() ?? 'S'}
          </div>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
            Vérifiez votre email
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Un lien vient d'être envoyé si le compte existe.
          </p>
        </div>

        <Alert variant="success" title="Email envoyé">
          Si un compte existe pour <span className="font-medium">{email}</span>,
          un lien de réinitialisation vient d’être envoyé.
        </Alert>

        <Link
          to="/auth/login"
          className="mt-5 block text-sm font-medium text-brand-600 hover:text-brand-700 text-center"
        >
          ← Retour à la connexion
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
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Entrez votre email, on vous envoie un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email" type="email" label="Email"
          placeholder="vous@exemple.com" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />

        {forgotPassword.isError && (
          <Alert variant="error">
            {forgotPassword.error?.message
              ?? 'Impossible d’envoyer l’email. Réessayez dans un instant.'}
          </Alert>
        )}

        <Button
          type="submit"
          loading={forgotPassword.isPending}
          className="w-full"
        >
          Envoyer le lien
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