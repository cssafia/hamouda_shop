// src/features/auth/useAuth.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from './useAuthStore'
import * as authApi from './api'

/* -------- Login -------- */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, admin }) => {
      setSession({ token, admin })
    },
  })
}

/* -------- Logout -------- */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/auth/login', { replace: true })
    },
  })
}

/* -------- Change password -------- */
export function useChangePassword() {
  return useMutation({ mutationFn: authApi.changePassword })
}

/* -------- Forget password -------- */
export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword })
}

/* -------- Reset password -------- */
export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword })
}