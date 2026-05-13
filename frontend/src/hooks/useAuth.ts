import { useAuthStore } from '../features/auth/authStore'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logout,
  getCurrentUserToken,
} from '../services/firebase/authService'

export function useAuth() {
  const { firebaseUser, role, token, isAuthenticated, isLoading } = useAuthStore()

  return {
    user: firebaseUser,
    role,
    token,
    isAuthenticated,
    isLoading,

    loginWithEmail: signInWithEmail,
    registerWithEmail: signUpWithEmail,
    loginWithGoogle: signInWithGoogle,
    logoutUser: logout,
    getIdToken: getCurrentUserToken,
  }
}
