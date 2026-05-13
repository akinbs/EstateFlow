import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, BedDouble, Bath, Maximize2, CalendarDays,
  Building2, Heart, Scale, Eye, ArrowLeft, AlertCircle,
} from 'lucide-react'
import { getPropertyBySlug } from '../services/api/propertyApi'
import type { Property, PropertyListItem, ComparePropertySnapshot } from '../types/property'
import { formatPrice } from '../utils/formatPrice'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ImageGallery from '../components/property/ImageGallery'
import PropertyInfoGrid from '../components/property/PropertyInfoGrid'
import PropertyFeatures from '../components/property/PropertyFeatures'
import ContactLeadForm from '../components/property/ContactLeadForm'
import MapView from '../components/map/MapView'
import { useFavoriteStore } from '../features/favorites/favoriteStore'
import { useCompareStore } from '../features/compare/compareStore'
import { cn } from '../utils/cn'

function makeSnapshot(p: Property): ComparePropertySnapshot {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    listingType: p.listingType,
    propertyType: p.propertyType,
    city: p.city,
    district: p.district,
    neighborhood: p.neighborhood,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    grossArea: p.grossArea,
    netArea: p.netArea,
    images: p.images,
    buildingAge: p.buildingAge,
    floor: p.floor,
    totalFloors: p.totalFloors,
    heating: p.heating,
    furnished: p.furnished,
  }
}

// Loading skeleton
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 h-4 w-24 rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-72 rounded-2xl bg-slate-200 sm:h-[420px]" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-7 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compareFull, setCompareFull] = useState(false)

  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const { toggleCompare, isSelected, isFull } = useCompareStore()

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    setNotFound(false)

    getPropertyBySlug(slug)
      .then((data) => {
        if (!cancelled) setProperty(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = (err as { response?: { status?: number } })?.response?.status
          if (status === 404) setNotFound(true)
          else setError('İlan yüklenirken bir sorun oluştu.')
          setProperty(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [slug])

  if (isLoading) return <DetailSkeleton />

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <AlertCircle size={28} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">İlan Bulunamadı</h2>
        <p className="mt-2 text-sm text-slate-500">
          Bu ilan mevcut değil ya da kaldırılmış olabilir.
        </p>
        <Link to="/properties" className="mt-5">
          <Button variant="primary">İlanlara Dön</Button>
        </Link>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">İlan yüklenemedi</h2>
        <p className="mt-2 text-sm text-slate-500">
          {error ?? 'Lütfen daha sonra tekrar deneyin.'}
        </p>
        <Link to="/properties" className="mt-5">
          <Button variant="outline">İlanlara Dön</Button>
        </Link>
      </div>
    )
  }

  const favorited = isFavorite(property.id)
  const inCompare = isSelected(property.id)

  function handleFavorite() {
    toggleFavorite(property as PropertyListItem)
  }

  function handleCompare() {
    setCompareFull(false)
    const ok = toggleCompare(makeSnapshot(property!))
    if (!ok) setCompareFull(true)
  }

  // Single-property array for MapView
  const mapProperties = [property] as unknown as PropertyListItem[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        to="/properties"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft size={14} />
        İlanlara Dön
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── Left col ──────────────────────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Gallery */}
          <ImageGallery images={property.images} title={property.title} />

          {/* Title section */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge variant={property.listingType === 'sale' ? 'info' : 'success'}>
                  {property.listingType === 'sale' ? 'Satılık' : 'Kiralık'}
                </Badge>
                {property.featured && <Badge variant="warning">Öne Çıkan</Badge>}
                {property.status !== 'active' && (
                  <Badge variant="default">{property.status}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-snug text-slate-900">{property.title}</h1>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} className="shrink-0" />
                {property.neighborhood && `${property.neighborhood}, `}
                {property.district}, {property.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-slate-900">
                {formatPrice(property.price, property.currency)}
              </p>
              {property.listingType === 'rent' && (
                <span className="text-sm text-slate-400">/ay</span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: BedDouble, label: 'Oda Sayısı', value: property.rooms },
              { icon: Bath, label: 'Banyo', value: property.bathrooms },
              { icon: Maximize2, label: 'Net m²', value: `${property.netArea} m²` },
              { icon: Building2, label: 'Kat', value: `${property.floor}/${property.totalFloors}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-white p-3 text-center">
                <Icon size={18} className="mx-auto mb-1 text-orange-500" />
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Açıklama</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {property.description}
              </p>
            </div>
          )}

          {/* Info grid */}
          <PropertyInfoGrid property={property} />

          {/* Features */}
          <PropertyFeatures features={property.features} />

          {/* Map */}
          <div className="overflow-hidden rounded-2xl">
            <MapView
              properties={mapProperties}
              selectedPropertyId={property.id}
              height="300px"
              className="!rounded-none"
            />
          </div>
        </div>

        {/* ── Right col — sidebar ───────────────────────────────────────── */}
        <div>
          <div className="sticky top-24 space-y-4">
            {/* Contact form card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">İletişime Geç</h2>
              <ContactLeadForm propertyId={property.id} propertyTitle={property.title} />
            </div>

            {/* Favorite + Compare */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex gap-2">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-all',
                    favorited
                      ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Heart
                    size={14}
                    fill={favorited ? 'currentColor' : 'none'}
                  />
                  {favorited ? 'Favoride' : 'Favorile'}
                </button>

                <button
                  onClick={handleCompare}
                  disabled={!inCompare && isFull()}
                  title={!inCompare && isFull() ? 'En fazla 3 ilan karşılaştırabilirsiniz' : undefined}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-all',
                    inCompare
                      ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : !inCompare && isFull()
                        ? 'cursor-not-allowed border-slate-100 text-slate-300'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Scale size={14} />
                  {inCompare ? 'Karşılaştırmada' : 'Karşılaştır'}
                </button>
              </div>

              {compareFull && !inCompare && (
                <p className="mt-2 text-center text-xs text-orange-500">
                  En fazla 3 ilan karşılaştırabilirsiniz.{' '}
                  <Link to="/compare" className="underline">
                    Karşılaştırmaya git
                  </Link>
                </p>
              )}

              {inCompare && (
                <Link
                  to="/compare"
                  className="mt-2 block text-center text-xs text-orange-600 underline underline-offset-2 hover:text-orange-700"
                >
                  Karşılaştırmayı Gör
                </Link>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 px-1 text-xs text-slate-400">
              {property.createdAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {new Date(property.createdAt).toLocaleDateString('tr-TR')}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye size={12} />
                {property.viewCount} görüntülenme
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
