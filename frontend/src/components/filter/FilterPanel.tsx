import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import Button from '../ui/Button'
import {
  buildSearchParamsFromFilters,
  getFiltersFromSearchParams,
} from '../../utils/queryParams'
import type { ListingType, PropertyType, PropertySortOption } from '../../types/property'

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya']
const ROOM_OPTIONS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+']
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Daire' },
  { value: 'house', label: 'Ev' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Arsa' },
  { value: 'office', label: 'Ofis' },
  { value: 'commercial', label: 'İşyeri' },
]
const SORT_OPTIONS: { value: PropertySortOption; label: string }[] = [
  { value: 'date_desc', label: 'En Yeni' },
  { value: 'date_asc', label: 'En Eski' },
  { value: 'price_asc', label: 'Fiyat (Artan)' },
  { value: 'price_desc', label: 'Fiyat (Azalan)' },
]

interface FormState {
  listingType: ListingType | ''
  propertyType: PropertyType | ''
  city: string
  district: string
  priceMin: string
  priceMax: string
  rooms: string[]
  sortBy: PropertySortOption
}

export default function FilterPanel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentFilters = getFiltersFromSearchParams(searchParams)

  const [form, setForm] = useState<FormState>({
    listingType: currentFilters.listingType ?? '',
    propertyType: currentFilters.propertyType ?? '',
    city: currentFilters.city ?? '',
    district: currentFilters.district ?? '',
    priceMin: currentFilters.priceMin?.toString() ?? '',
    priceMax: currentFilters.priceMax?.toString() ?? '',
    rooms: currentFilters.rooms ?? [],
    sortBy: currentFilters.sortBy ?? 'date_desc',
  })

  function toggleRoom(r: string) {
    setForm((f) => ({
      ...f,
      rooms: f.rooms.includes(r) ? f.rooms.filter((x) => x !== r) : [...f.rooms, r],
    }))
  }

  function handleSubmit() {
    const filters = {
      listingType: form.listingType || undefined,
      propertyType: form.propertyType || undefined,
      city: form.city || undefined,
      district: form.district || undefined,
      priceMin: form.priceMin ? Number(form.priceMin) : undefined,
      priceMax: form.priceMax ? Number(form.priceMax) : undefined,
      rooms: form.rooms.length ? form.rooms : undefined,
      sortBy: form.sortBy !== 'date_desc' ? form.sortBy : undefined,
      page: undefined,
    }
    const params = buildSearchParamsFromFilters(filters)
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function handleReset() {
    setForm({
      listingType: '',
      propertyType: '',
      city: '',
      district: '',
      priceMin: '',
      priceMax: '',
      rooms: [],
      sortBy: 'date_desc',
    })
    navigate('/properties')
  }

  const hasActiveFilters =
    form.listingType ||
    form.propertyType ||
    form.city ||
    form.district ||
    form.priceMin ||
    form.priceMax ||
    form.rooms.length > 0 ||
    form.sortBy !== 'date_desc'

  return (
    <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal size={15} className="text-orange-500" />
          Filtreler
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-500"
          >
            <X size={12} />
            Temizle
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Sıralama */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Sıralama</p>
          <select
            value={form.sortBy}
            onChange={(e) => setForm((f) => ({ ...f, sortBy: e.target.value as PropertySortOption }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* İlan Tipi */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">İlan Tipi</p>
          <div className="flex gap-2">
            {(['sale', 'rent'] as ListingType[]).map((type) => (
              <button
                key={type}
                onClick={() =>
                  setForm((f) => ({ ...f, listingType: f.listingType === type ? '' : type }))
                }
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                  form.listingType === type
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {type === 'sale' ? 'Satılık' : 'Kiralık'}
              </button>
            ))}
          </div>
        </div>

        {/* Emlak Tipi */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Emlak Tipi</p>
          <select
            value={form.propertyType}
            onChange={(e) =>
              setForm((f) => ({ ...f, propertyType: e.target.value as PropertyType | '' }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tüm Tipler</option>
            {PROPERTY_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Şehir */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Şehir</p>
          <select
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, district: '' }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tüm Şehirler</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* İlçe */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">İlçe</p>
          <input
            type="text"
            placeholder="İlçe ara..."
            value={form.district}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Fiyat */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Fiyat (₺)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={form.priceMin}
              onChange={(e) => setForm((f) => ({ ...f, priceMin: e.target.value }))}
              className="w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={form.priceMax}
              onChange={(e) => setForm((f) => ({ ...f, priceMax: e.target.value }))}
              className="w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Oda Sayısı */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Oda Sayısı</p>
          <div className="flex flex-wrap gap-1.5">
            {ROOM_OPTIONS.map((r) => {
              const active = form.rooms.includes(r)
              return (
                <button
                  key={r}
                  onClick={() => toggleRoom(r)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>

        <Button variant="primary" size="md" className="w-full" onClick={handleSubmit}>
          Filtrele
        </Button>
      </div>
    </aside>
  )
}
