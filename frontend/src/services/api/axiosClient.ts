import axios from 'axios'
import { getCurrentUserToken } from '../firebase/authService'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Firebase ID token to every request if user is authenticated.
// Avoids circular imports by calling authService directly (not the Zustand store).
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await getCurrentUserToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response
      if (status === 401) {
        // Token expired or invalid — redirect to login
        window.location.href = '/login'
      }
      if (status === 403) {
        console.warn('[EstateFlow] 403 Forbidden — insufficient permissions')
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient
