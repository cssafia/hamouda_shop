import axios from 'axios'
import { useAuthStore } from '../features/auth/useAuthStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  // Let the browser set the boundary for FormData uploads
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      useAuthStore.getState().logout()
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/auth/login'     
      }
    }

    const data = error.response?.data
    return Promise.reject({
      status,
      message: data?.message || error.message || 'Something went wrong',
      details: data?.details || null,
    })
  }
)