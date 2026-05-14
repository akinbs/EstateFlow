import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, TrendingUp, MessageSquare, Star, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { getAdminStats, getAdminProperties, getAdminLeads, type AdminStats } from '../../services/api/adminApi'
import type { PropertyListItem } from '../../types/property'
import type { Lead } from '../../types/lead'
import { formatPrice } from '../../utils/formatPrice'
import type { BadgeVariant } from '../../components/ui/Badge'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  new:       { label: 'Yeni',             variant: 'warning' },
  contacted: { label: 'İletişime Geçildi', variant: 'info' },
  closed:    { label: 'Kapatıldı',        variant: 'default' },
}

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentProperties, setRecentProperties] = useState<PropertyListItem[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [statsData, propsData, leadsData] = await Promise.all([
          getAdminStats(),
          getAdminProperties({ limit: 5, sortBy: 'date_desc' }),
          getAdminLeads({ limit: 5 }),
        ])
        if (!cancelled) {
          setStats(statsData)
          setRecentProperties(propsData.data)
          setRecentLeads(leadsData.data)
        }
      } catch {
        if (!cancelled) setError('Veriler yüklenirken bir sorun oluştu.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-400">Backend'in çalıştığından ve token'ın geçerli olduğundan emin olun.</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Toplam İlan', value: stats?.totalProperties ?? 0, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Aktif İlan', value: stats?.activeProperties ?? 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Öne Çıkan', value: stats?.featuredProperties ?? 0, icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Yeni Talep', value: stats?.newLeads ?? 0, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">EstateFlow Admin Paneli</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent properties */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Son İlanlar</CardTitle>
            <Link to="/admin/properties" className="text-xs text-orange-500 hover:text-orange-600">
              Tümünü gör
            </Link>
          </CardHeader>
          <CardContent>
            {recentProperties.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Henüz ilan yok</p>
            ) : (
              <div className="space-y-3">
                {recentProperties.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.images[0] ? (
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="h-10 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-14 shrink-0 rounded-lg bg-slate-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-400">
                        {p.city} · {formatPrice(p.price, p.currency)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.status === 'active' ? 'Aktif' : p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Son Talepler</CardTitle>
            <Link to="/admin/leads" className="text-xs text-orange-500 hover:text-orange-600">
              Tümünü gör
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Henüz talep yok</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => {
                  const { label, variant } = statusConfig[lead.status] ?? { label: lead.status, variant: 'default' as BadgeVariant }
                  return (
                    <div key={lead.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {lead.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                        <p className="truncate text-xs text-slate-400">{lead.propertyTitle ?? '—'}</p>
                      </div>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
