import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { UserRole } from '../../types/user'
import { subscribeToAuthChanges } from '../../services/firebase/authService'

// TODO (Step 4+): Real role validation will be handled by FastAPI + Firebase Admin
// custom claims. Currently role is derived from a simple heuristic.

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
        const token = await user.getIdToken()

        // TODO (Step 4): Fetch actual role from FastAPI /auth/me endpoint
        // using the token. For now, derive a placeholder role.
        const role: UserRole = 'user'

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
