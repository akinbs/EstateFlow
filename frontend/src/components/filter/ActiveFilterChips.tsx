import { useNavigate, useSearchParams } from 'react-router-dom'
import { X, SlidersHorizontal } from 'lucide-react'
import { getFiltersFromSearchParams, buildSearchParamsFromFilters } from '../../utils/queryParams'
import type { PropertyFilters } from '../../types/property'

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: 'Satılık',
  rent: 'Kiralık',
}
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Daire',
  house: 'Ev',
  villa: 'Villa',
  land: 'Arsa',
  office: 'Ofis',
  commercial: 'İşyeri',
}
const SORT_LABELS: Record<string, string> = {
  date_asc: 'En Eski',
  price_asc: 'Fiyat Artan',
  price_desc: 'Fiyat Azalan',
}

interface Chip {
  key: string
  label: string
  remove: () => void
}

export default function ActiveFilterChips() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const filters = getFiltersFromSearchParams(searchParams)

  function applyFilters(updated: PropertyFilters) {
    const params = buildSearchParamsFromFilters({ ...updated, page: undefined })
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const chips: Chip[] = []

  if (filters.listingType) {
    chips.push({
      key: 'listingType',
      label: LISTING_TYPE_LABELS[filters.listingType] ?? filters.listingType,
      remove: () => applyFilters({ ...filters, listingType: undefined }),
    })
  }

  if (filters.propertyType) {
    chips.push({
      key: 'propertyType',
      label: PROPERTY_TYPE_LABELS[filters.propertyType] ?? filters.propertyType,
      remove: () => applyFilters({ ...filters, propertyType: undefined }),
    })
  }

  if (filters.city) {
    chips.push({
      key: 'city',
      label: filters.city,
      remove: () => applyFilters({ ...filters, city: undefined }),
    })
  }

  if (filters.district) {
    chips.push({
      key: 'district',
      label: filters.district,
      remove: () => applyFilters({ ...filters, district: undefined }),
    })
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const min = filters.priceMin !== undefined
      ? `₺${filters.priceMin.toLocaleString('tr-TR')}`
      : ''
    const max = filters.priceMax !== undefined
      ? `₺${filters.priceMax.toLocaleString('tr-TR')}`
      : ''
    const label =
      min && max ? `${min} — ${max}` : min ? `Min ${min}` : `Max ${max}`
    chips.push({
      key: 'price',
      label,
      remove: () =>
        applyFilters({ ...filters, priceMin: undefined, priceMax: undefined }),
    })
  }

  if (filters.rooms?.length) {
    filters.rooms.forEach((room) => {
      chips.push({
        key: `room-${room}`,
        label: room,
        remove: () => {
          const newRooms = filters.rooms?.filter((r) => r !== room)
          applyFilters({ ...filters, rooms: newRooms?.length ? newRooms : undefined })
        },
      })
    })
  }

  if (filters.sortBy && filters.sortBy !== 'date_desc') {
    chips.push({
      key: 'sortBy',
      label: SORT_LABELS[filters.sortBy] ?? filters.sortBy,
      remove: () => applyFilters({ ...filters, sortBy: undefined }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal size={13} className="shrink-0 text-slate-400" />
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remove}
          className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
        >
          {chip.label}
          <X size={11} />
        </button>
      ))}
      <button
        onClick={() => navigate('/properties')}
        className="text-xs text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-600"
      >
        Tümünü temizle
      </button>
    </div>
  )
}
