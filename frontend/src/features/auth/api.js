import { apiClient } from '../../services/apiClient'

/* 1. POST /api/auth/login */
export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data.data                     // { token, admin }
}

/* 2. POST /api/auth/logout */
export async function logout() {
  const { data } = await apiClient.post('/auth/logout')
  return data
}

/* 3. PATCH /api/auth/password */
export async function changePassword({ current_password, new_password }) {
  const { data } = await apiClient.patch('/auth/password', {
    current_password,
    new_password,
  })
  return data
}

/* 4. POST /api/auth/forget-password */
export async function forgotPassword({ email }) {
  const { data } = await apiClient.post('/auth/forget-password', { email })
  return data
}

//  5. POST /api/auth/reset-password
export async function resetPassword({ token, password }) {
  const { data } = await apiClient.post('/auth/reset-password', {
    token,
    new_password: password,
  })
  return data
}