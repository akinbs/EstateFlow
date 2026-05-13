import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/property/PropertyCard'
import PropertyListItemRow from '../components/property/PropertyListItemRow'
import ViewModeToggle from '../components/property/ViewModeToggle'
import FilterPanel from '../components/filter/FilterPanel'
import ActiveFilterChips from '../components/filter/ActiveFilterChips'
import MapView from '../components/map/MapView'
import LoadingGrid from '../components/ui/LoadingGrid'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import { usePropertyStore } from '../features/properties/propertyStore'
import { useProperties } from '../hooks/useProperties'
import { getFiltersFromSearchParams, buildSearchParamsFromFilters } from '../utils/queryParams'
import type { ViewMode } from '../types/common'

const SORT_LABELS: Record<string, string> = {
  date_desc: 'En Yeni',
  date_asc: 'En Eski',
  price_asc: 'Fiyat (Artan)',
  price_desc: 'Fiyat (Azalan)',
}

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { viewMode, setViewMode } = usePropertyStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filters = getFiltersFromSearchParams(searchParams)
  const { data, meta, isLoading, error, refetch } = useProperties(filters)

  const currentSort = filters.sortBy ?? 'date_desc'

  const handlePageChange = useCallback(
    (page: number) => {
      const current = getFiltersFromSearchParams(searchParams)
      setSearchParams(buildSearchParamsFromFilters({ ...current, page }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [searchParams, setSearchParams],
  )

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = buildSearchParamsFromFilters({
      ...filters,
      sortBy: e.target.value as typeof filters.sortBy,
      page: undefined,
    })
    setSearchParams(next)
  }

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    setSelectedId(null)
  }

  // ── Shared toolbar (rendered in both layouts) ──────────────────────────────
  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {isLoading ? (
          <p className="text-sm text-slate-400">Yükleniyor…</p>
        ) : meta ? (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{meta.total}</span> ilan
            {meta.totalPages > 1 && (
              <span className="text-slate-400">
                {' '}· Sayfa {meta.page}/{meta.totalPages}
              </span>
            )}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ViewModeToggle value={viewMode} onChange={handleViewMode} />
      </div>
    </div>
  )

  // ── Active filter chips ────────────────────────────────────────────────────
  const filterChips = <ActiveFilterChips />

  // ── Loading / Error / Empty states ─────────────────────────────────────────
  const stateContent = isLoading ? (
    <LoadingGrid count={viewMode === 'map' ? 6 : 12} />
  ) : error ? (
    <ErrorState
      title="İlanlar yüklenemedi"
      message="İlanlar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
      onRetry={refetch}
    />
  ) : data.length === 0 ? (
    <EmptyState
      title="Uygun ilan bulunamadı"
      description="Arama kriterlerinizi değiştirerek tekrar deneyin."
    />
  ) : null

  // ── Grid view ──────────────────────────────────────────────────────────────
  const gridView = !isLoading && !error && data.length > 0 && (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )

  // ── List rows (used in list mode and map split panel) ─────────────────────
  const listRows = (
    <div className="space-y-3">
      {data.map((p) => (
        <PropertyListItemRow
          key={p.id}
          property={p}
          isSelected={p.id === selectedId}
          onSelect={setSelectedId}
        />
      ))}
    </div>
  )

  // ── Pagination ─────────────────────────────────────────────────────────────
  const pagination = !isLoading && !error && meta && meta.totalPages > 1 && (
    <div className="mt-8">
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        hasNext={meta.hasNext}
        hasPrev={meta.hasPrev}
        onPageChange={handlePageChange}
      />
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP MODE — split layout: filter sidebar + list panel + sticky map
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewMode === 'map') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Page header strip */}
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="mb-3 text-xl font-bold text-slate-900">Emlak İlanları</h1>
          {toolbar}
          {filterChips && (
            <div className="mt-2">
              {filterChips}
            </div>
          )}
        </div>

        {/* ── Desktop: filter | list panel | map ───────────────────── */}
        <div className="hidden flex-1 overflow-hidden lg:flex">
          {/* Filter sidebar */}
          <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-100 bg-white p-4">
            <FilterPanel />
          </aside>

          {/* List panel (xl+) */}
          <div className="hidden w-80 shrink-0 overflow-y-auto border-r border-slate-100 bg-slate-50 p-4 xl:block">
            {stateContent}
            {!isLoading && !error && data.length > 0 && listRows}
          </div>

          {/* Map panel — fills remaining space */}
          <div className="relative flex-1">
            <MapView
              properties={data}
              selectedPropertyId={selectedId}
              onSelectProperty={setSelectedId}
              height="100%"
              className="!rounded-none"
            />
          </div>
        </div>

        {/* ── Mobile: map at top + scrollable list below ──────────── */}
        <div className="flex-1 lg:hidden">
          <MapView
            properties={data}
            selectedPropertyId={selectedId}
            onSelectProperty={setSelectedId}
            height="55vw"
            className="!rounded-none"
          />
          <div className="space-y-3 p-4">
            {stateContent}
            {!isLoading && !error && data.length > 0 && listRows}
            {pagination}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID / LIST MODE — standard sidebar layout
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Emlak İlanları</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filter sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <FilterPanel />
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-3">{toolbar}</div>

          {/* Active chips */}
          <div className="mb-4">{filterChips}</div>

          {/* States */}
          {stateContent}

          {/* Grid */}
          {viewMode === 'grid' && gridView}

          {/* List */}
          {viewMode === 'list' && !isLoading && !error && data.length > 0 && listRows}

          {/* Pagination */}
          {pagination}
        </div>
      </div>
    </div>
  )
}
