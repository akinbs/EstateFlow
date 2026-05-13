import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  MessageSquare,
  ArrowLeft,
  Building,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { href: '/admin/properties', label: 'İlanlar', icon: Building2 },
  { href: '/admin/properties/new', label: 'Yeni İlan', icon: PlusCircle },
  { href: '/admin/leads', label: 'Talepler', icon: MessageSquare },
]

export default function Sidebar() {
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
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {sidebarLinks.map(({ href, label, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
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

      {/* Back to site */}
      <div className="border-t border-slate-100 p-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Siteye Dön
        </Link>
      </div>
    </aside>
  )
}
