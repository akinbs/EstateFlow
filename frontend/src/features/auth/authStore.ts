import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { UserRole } from '../../types/user'
import { subscribeToAuthChanges } from '../../services/firebase/authService'

interface AuthState {
  firebaseUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole | null
  token: string | null

  setFirebaseUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRole: (role: UserRole | null) => void
  clearAuth: () => void
  initializeAuthListener: () => () => void
}

async function fetchRoleFromApi(token: string): Promise<UserRole> {
  try {
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return 'user'
    const data = (await res.json()) as { role?: string }
    if (data.role === 'admin' || data.role === 'agent') return data.role
  } catch {
    // backend kapalı veya timeout → 'user' varsayılanı
  }
  return 'user'
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  token: null,

  setFirebaseUser: (user) =>
    set({
      firebaseUser: user,
      isAuthenticated: !!user,
    }),

  setToken: (token) => set({ token }),

  setRole: (role) => set({ role }),

  clearAuth: () =>
    set({
      firebaseUser: null,
      isAuthenticated: false,
      role: null,
      token: null,
    }),

  initializeAuthListener: () => {
    set({ isLoading: true })

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        const token = await user.getIdToken(true) // force-refresh: custom claims'i dahil et
        const role = await fetchRoleFromApi(token)

        set({
          firebaseUser: user,
          isAuthenticated: true,
          token,
          role,
          isLoading: false,
        })
      } else {
        set({
          firebaseUser: null,
          isAuthenticated: false,
          token: null,
          role: null,
          isLoading: false,
        })
      }
    })

    return unsubscribe
  },
}))
