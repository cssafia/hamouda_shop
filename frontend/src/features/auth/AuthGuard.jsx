import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from './useAuthStore'

export default function AuthGuard({ roles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const admin = useAuthStore((s) => s.admin)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (roles?.length && !roles.includes(admin?.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}