import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu, X, Home, Building2, Heart, Scale,
  LogIn, LogOut, LayoutDashboard, ChevronDown,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

// TODO (Step 4+): Admin link visibility should be based on verified custom claims
// from FastAPI /auth/me, not client-side role state alone.

const navLinks = [
  { href: '/',           label: 'Ana Sayfa', icon: Home },
  { href: '/properties', label: 'İlanlar',   icon: Building2 },
  { href: '/favorites',  label: 'Favoriler', icon: Heart },
  { href: '/compare',    label: 'Karşılaştır', icon: Scale },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, role, isAuthenticated, logoutUser } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Kullanıcı'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Estate<span className="text-orange-500">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <NavLink
              key={href}
              to={href}
              end={href === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              {/* Admin link — only visible for admin/agent role */}
              {(role === 'admin' || role === 'agent') && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
                    <LayoutDashboard size={15} />
                    Admin
                  </Button>
                </Link>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={displayName} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-2xl border border-slate-100 bg-white py-1 shadow-lg">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs font-medium text-slate-900 truncate">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        {role && (
                          <span className="mt-1 inline-block rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                            {role}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" className="gap-1.5">
                <LogIn size={15} />
                Giriş Yap
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Menüyü aç/kapat"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-700 hover:bg-slate-50',
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {(role === 'admin' || role === 'agent') && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <LayoutDashboard size={15} />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full gap-1.5">
                    <LogIn size={15} />
                    Giriş Yap
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
