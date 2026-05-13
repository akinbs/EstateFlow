import { Outlet } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-800">EstateFlow</span> Admin Paneli
          </p>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
