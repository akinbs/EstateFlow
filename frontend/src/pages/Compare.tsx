import { Link } from 'react-router-dom'
import { Scale, X, Maximize2 } from 'lucide-react'
import Button from '../components/ui/Button'
import { useCompareStore } from '../features/compare/compareStore'
import type { ComparePropertySnapshot } from '../types/property'
import { formatPrice } from '../utils/formatPrice'

interface CompareField {
  label: string
  render: (p: ComparePropertySnapshot) => string
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Daire',
  house: 'Ev',
  villa: 'Villa',
  land: 'Arsa',
  office: 'Ofis',
  commercial: 'İşyeri',
}

const compareFields: CompareField[] = [
  { label: 'Fiyat', render: (p) => formatPrice(p.price, p.currency) },
  { label: 'İlan Tipi', render: (p) => (p.listingType === 'sale' ? 'Satılık' : 'Kiralık') },
  { label: 'Emlak Tipi', render: (p) => PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType },
  { label: 'Şehir', render: (p) => p.city },
  { label: 'İlçe', render: (p) => p.district },
  { label: 'Oda Sayısı', render: (p) => p.rooms },
  { label: 'Banyo', render: (p) => String(p.bathrooms) },
  { label: 'Net Alan', render: (p) => `${p.netArea} m²` },
  { label: 'Brüt Alan', render: (p) => `${p.grossArea} m²` },
  { label: 'Bina Yaşı', render: (p) => (p.buildingAge !== undefined ? `${p.buildingAge} yıl` : '—') },
  { label: 'Bulunduğu Kat', render: (p) => (p.floor !== undefined && p.totalFloors !== undefined ? `${p.floor}/${p.totalFloors}` : p.floor !== undefined ? String(p.floor) : '—') },
  { label: 'Isıtma', render: (p) => p.heating ?? '—' },
  { label: 'Eşyalı', render: (p) => (p.furnished !== undefined ? (p.furnished ? 'Evet' : 'Hayır') : '—') },
]

export default function Compare() {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompareStore()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale size={22} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-900">Karşılaştır</h1>
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
            {selectedProperties.length} / 3
          </span>
        </div>
        {selectedProperties.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Temizle
          </Button>
        )}
      </div>

      {selectedProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Scale size={28} className="text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700">Karşılaştırılacak ilan seçilmedi</h2>
          <p className="mt-2 text-sm text-slate-400">
            İlan kartlarından veya detay sayfasından en fazla 3 ilan ekleyebilirsiniz.
          </p>
          <Link to="/properties" className="mt-5">
            <Button variant="primary">İlanları İncele</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-36 py-4 pl-5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400" />
                {selectedProperties.map((p) => (
                  <th key={p.id} className="px-5 py-4 text-left align-top">
                    <div className="flex flex-col gap-2">
                      {p.images[0] ? (
                        <img
                          src={p.images[0].url}
                          alt={p.title}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-300">
                          <Maximize2 size={24} />
                        </div>
                      )}
                      <Link
                        to={`/properties/${p.slug}`}
                        className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-orange-600 transition-colors"
                      >
                        {p.title}
                      </Link>
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-500"
                      >
                        <X size={12} />
                        Kaldır
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map(({ label, render }) => (
                <tr key={label} className="border-t border-slate-100 even:bg-slate-50">
                  <td className="py-3 pl-5 pr-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {label}
                  </td>
                  {selectedProperties.map((p) => (
                    <td key={p.id} className="px-5 py-3 text-sm text-slate-800">
                      {render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
