// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { useLogin } from '../../features/auth/useAuth.js';
import { SHOP_NAME } from '../../constants/config.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const redirectTo = location.state?.from?.pathname || '/admin';

  function handleSubmit(e) {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate(redirectTo, { replace: true }) }
    );
  }

  return (
    <div className="card p-6 sm:p-7 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-11 w-11 rounded-control bg-brand-500 text-white grid place-items-center font-semibold shadow-sm">
          {SHOP_NAME?.[0]?.toUpperCase() ?? 'S'}
        </div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
          Bienvenue sur {SHOP_NAME}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Connectez-vous pour accéder à votre espace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email" type="email" label="Email"
          placeholder="vous@exemple.com" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <Input
          id="password" type="password" label="Mot de passe"
          placeholder="••••••••" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />

        <div className="flex justify-end -mt-2">
          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {login.isError && (
          <Alert variant="error">
            {login.error?.message ?? 'Identifiants incorrects. Réessayez.'}
          </Alert>
        )}

        <Button type="submit" loading={login.isPending} className="w-full">
          Se connecter
        </Button>
      </form>
    </div>
  );
}