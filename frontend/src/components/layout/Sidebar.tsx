import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  ArrowLeft,
  Building,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { logout } from '../../services/firebase/authService'
import { useAuthStore } from '../../features/auth/authStore'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { href: '/admin/properties', label: 'İlanlar', icon: Building2 },
  { href: '/admin/properties/new', label: 'Yeni İlan', icon: PlusCircle },
  { href: '/admin/leads', label: 'Talepler', icon: MessageSquare },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  async function handleLogout() {
    await logout()
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500">
          <Building size={15} className="text-white" />
        </div>
        <span className="font-bold text-slate-900">
          Estate<span className="text-orange-500">Flow</span>
        </span>
        <span className="ml-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-600">
          Admin
        </span>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {sidebarLinks.map(({ href, label, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 space-y-0.5">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Siteye Dön
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
