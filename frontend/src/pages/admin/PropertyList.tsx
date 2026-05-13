import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { mockProperties } from '../../utils/mockData'
import { formatPrice } from '../../utils/formatPrice'
import type { BadgeVariant } from '../../components/ui/Badge'

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  active:  { label: 'Aktif',   variant: 'success' },
  passive: { label: 'Pasif',   variant: 'default' },
  draft:   { label: 'Taslak',  variant: 'warning' },
  sold:    { label: 'Satıldı', variant: 'info'    },
  rented:  { label: 'Kiralandı', variant: 'info'  },
}

export default function PropertyList() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">İlanlar</h1>
          <p className="mt-0.5 text-sm text-slate-500">{mockProperties.length} ilan</p>
        </div>
        <Link to="/admin/properties/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <Plus size={15} />
            Yeni İlan
          </Button>
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="İlan ara..."
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
          <option value="draft">Taslak</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['İlan', 'Fiyat', 'Tür', 'Şehir', 'Durum', 'İşlem'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockProperties.map((p) => {
                const { label, variant } = statusConfig[p.status] ?? { label: p.status, variant: 'default' }
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]?.url}
                          alt={p.title}
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="max-w-[200px] truncate text-sm font-medium text-slate-900">{p.title}</p>
                          <p className="text-xs text-slate-400">{p.listingType === 'sale' ? 'Satılık' : 'Kiralık'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {formatPrice(p.price, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600">{p.propertyType}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.city}</td>
                    <td className="px-4 py-3">
                      <Badge variant={variant}>{label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/properties/${p.slug}`}>
                          <button title="Görüntüle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <Eye size={14} />
                          </button>
                        </Link>
                        <Link to={`/admin/properties/${p.id}/edit`}>
                          <button title="Düzenle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button title="Sil" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
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

      <p className="text-center text-xs text-slate-400">
        Gerçek CRUD işlemleri Adım 9'da FastAPI ile entegre edilecek
      </p>
    </div>
  )
}
