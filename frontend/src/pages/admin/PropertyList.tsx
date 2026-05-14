import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Eye, Star, ToggleLeft, ToggleRight,
  AlertCircle, Loader2,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import {
  getAdminProperties,
  updatePropertyStatus,
  updatePropertyFeatured,
  deleteAdminProperty,
} from '../../services/api/adminApi'
import type { PropertyListItem, PropertyStatus } from '../../types/property'
import type { PaginationMeta } from '../../types/common'
import { formatPrice } from '../../utils/formatPrice'
import type { BadgeVariant } from '../../components/ui/Badge'

const statusConfig: Record<PropertyStatus, { label: string; variant: BadgeVariant }> = {
  active:  { label: 'Aktif',      variant: 'success' },
  passive: { label: 'Pasif',      variant: 'default' },
  draft:   { label: 'Taslak',     variant: 'warning' },
  sold:    { label: 'Satıldı',    variant: 'info' },
  rented:  { label: 'Kiralandı',  variant: 'info' },
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',     label: 'Tüm Durumlar' },
  { value: 'active',  label: 'Aktif' },
  { value: 'passive', label: 'Pasif' },
  { value: 'draft',   label: 'Taslak' },
  { value: 'sold',    label: 'Satıldı' },
  { value: 'rented',  label: 'Kiralandı' },
]

export default function PropertyList() {
  const [properties, setProperties] = useState<PropertyListItem[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminProperties({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 20,
      })
      setProperties(data.data)
      setMeta(data.meta)
    } catch {
      setError('İlanlar yüklenirken bir sorun oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Client-side search filter
  const filtered = search.trim()
    ? properties.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()),
      )
    : properties

  async function handleStatusToggle(p: PropertyListItem) {
    const newStatus: PropertyStatus = p.status === 'active' ? 'passive' : 'active'
    setActionId(`status-${p.id}`)
    try {
      await updatePropertyStatus(p.id, newStatus)
      await fetchProperties()
    } catch {
      alert('Durum güncellenemedi.')
    } finally {
      setActionId(null)
    }
  }

  async function handleFeaturedToggle(p: PropertyListItem) {
    setActionId(`feat-${p.id}`)
    try {
      await updatePropertyFeatured(p.id, !p.featured)
      await fetchProperties()
    } catch {
      alert('Öne çıkan durumu güncellenemedi.')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(p: PropertyListItem) {
    if (!window.confirm(`"${p.title}" ilanı pasife alınacak. Onaylıyor musunuz?`)) return
    setActionId(`del-${p.id}`)
    try {
      await deleteAdminProperty(p.id)
      await fetchProperties()
    } catch {
      alert('İlan silinemedi.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">İlanlar</h1>
          {meta && (
            <p className="mt-0.5 text-sm text-slate-500">
              {meta.total} ilan
              {search && ` · "${search}" araması`}
            </p>
          )}
        </div>
        <Link to="/admin/properties/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus size={15} />
            Yeni İlan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Başlık veya şehir ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProperties}>Tekrar Dene</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">İlan bulunamadı</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {['İlan', 'Fiyat', 'Şehir', 'Durum', 'Öne Çıkan', 'İşlem'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => {
                  const { label, variant } = statusConfig[p.status] ?? { label: p.status, variant: 'default' as BadgeVariant }
                  const isActing = actionId?.endsWith(p.id)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* İlan */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <img
                              src={p.images[0].url}
                              alt={p.title}
                              className="h-10 w-14 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-14 shrink-0 rounded-lg bg-slate-100" />
                          )}
                          <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-sm font-medium text-slate-900">
                              {p.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {p.listingType === 'sale' ? 'Satılık' : 'Kiralık'}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Fiyat */}
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">
                        {formatPrice(p.price, p.currency)}
                      </td>
                      {/* Şehir */}
                      <td className="px-4 py-3 text-sm text-slate-600">{p.city}</td>
                      {/* Durum */}
                      <td className="px-4 py-3">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      {/* Öne çıkan toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleFeaturedToggle(p)}
                          disabled={!!isActing}
                          title={p.featured ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
                          className="transition-colors"
                        >
                          {actionId === `feat-${p.id}` ? (
                            <Loader2 size={16} className="animate-spin text-slate-400" />
                          ) : (
                            <Star
                              size={16}
                              className={p.featured ? 'text-orange-500' : 'text-slate-300 hover:text-orange-400'}
                              fill={p.featured ? 'currentColor' : 'none'}
                            />
                          )}
                        </button>
                      </td>
                      {/* İşlemler */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Görüntüle */}
                          <Link to={`/properties/${p.slug}`} target="_blank">
                            <button title="Önizle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                              <Eye size={14} />
                            </button>
                          </Link>
                          {/* Düzenle */}
                          <Link to={`/admin/properties/${p.id}/edit`}>
                            <button title="Düzenle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                              <Pencil size={14} />
                            </button>
                          </Link>
                          {/* Status toggle */}
                          <button
                            title={p.status === 'active' ? 'Pasife al' : 'Aktife al'}
                            onClick={() => handleStatusToggle(p)}
                            disabled={!!isActing}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          >
                            {actionId === `status-${p.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : p.status === 'active' ? (
                              <ToggleRight size={14} className="text-emerald-500" />
                            ) : (
                              <ToggleLeft size={14} />
                            )}
                          </button>
                          {/* Sil (soft) */}
                          <button
                            title="Pasife al (sil)"
                            onClick={() => handleDelete(p)}
                            disabled={!!isActing}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            {actionId === `del-${p.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasNext={meta.hasNext}
          hasPrev={meta.hasPrev}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  )
}
