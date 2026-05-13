import { Navigate, Outlet } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuthStore } from './authStore'
import Spinner from '../../components/ui/Spinner'
import type { UserRole } from '../../types/user'

interface ProtectedRouteProps {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
}

// TODO (Step 4+): Role enforcement will be tightened once FastAPI returns
// the real role from Firebase Admin custom claims via /auth/me endpoint.

export default function ProtectedRoute({
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Yetkisiz Erişim</h2>
        <p className="max-w-xs text-sm text-slate-500">
          Bu sayfayı görüntülemek için yeterli yetkiniz bulunmuyor.
        </p>
        <Navigate to="/" replace />
      </div>
    )
  }

  return <Outlet />
}
