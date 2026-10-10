import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-surface-subtle flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}