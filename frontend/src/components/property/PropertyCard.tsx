import { Link } from 'react-router-dom'
import { Heart, MapPin, BedDouble, Bath, Maximize2, ArrowRight, Scale } from 'lucide-react'
import type { PropertyListItem, ComparePropertySnapshot } from '../../types/property'
import { formatPrice } from '../../utils/formatPrice'
import { cn } from '../../utils/cn'
import Badge from '../ui/Badge'
import { useFavoriteStore } from '../../features/favorites/favoriteStore'
import { useCompareStore } from '../../features/compare/compareStore'

interface PropertyCardProps {
  property: PropertyListItem
}

const listingTypeLabel: Record<PropertyListItem['listingType'], string> = {
  sale: 'Satılık',
  rent: 'Kiralık',
}

const listingTypeBadge: Record<PropertyListItem['listingType'], 'info' | 'success'> = {
  sale: 'info',
  rent: 'success',
}

const propertyTypeLabel: Record<PropertyListItem['propertyType'], string> = {
  apartment: 'Daire',
  house: 'Ev',
  villa: 'Villa',
  land: 'Arsa',
  office: 'Ofis',
  commercial: 'İşyeri',
}

function makeSnapshot(p: PropertyListItem): ComparePropertySnapshot {
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
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const { toggleCompare, isSelected, isFull } = useCompareStore()

  const favorited = isFavorite(property.id)
  const inCompare = isSelected(property.id)
  const compareFull = isFull() && !inCompare

  const mainImage = property.images[0]

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Image */}
      <Link
        to={`/properties/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt ?? property.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
            <Maximize2 size={36} />
            <span className="text-xs">Fotoğraf yok</span>
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant={listingTypeBadge[property.listingType]}>
            {listingTypeLabel[property.listingType]}
          </Badge>
          {property.featured && <Badge variant="warning">Öne Çıkan</Badge>}
        </div>

        {/* Property type */}
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {propertyTypeLabel[property.propertyType]}
        </span>

        {/* Action buttons — top right */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {/* Compare */}
          <button
            onClick={(e) => {
              e.preventDefault()
              if (!compareFull) toggleCompare(makeSnapshot(property))
            }}
            aria-label={inCompare ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'}
            title={compareFull ? 'En fazla 3 ilan karşılaştırabilirsiniz' : undefined}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
              'bg-white/90 shadow-sm hover:scale-110 hover:bg-white',
              inCompare ? 'text-orange-500' : compareFull ? 'text-slate-200' : 'text-slate-400 hover:text-orange-400',
            )}
          >
            <Scale size={14} />
          </button>

          {/* Favorite */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleFavorite(property)
            }}
            aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all',
              'bg-white/90 shadow-sm hover:scale-110 hover:bg-white',
              favorited ? 'text-red-500' : 'text-slate-400 hover:text-red-400',
            )}
          >
            <Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price */}
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-bold text-slate-900">
            {formatPrice(property.price, property.currency)}
          </p>
          {property.listingType === 'rent' && (
            <span className="text-xs text-slate-400">/ay</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/properties/${property.slug}`}>
          <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-orange-600">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">
            {property.neighborhood ? `${property.neighborhood}, ` : ''}
            {property.district}, {property.city}
          </span>
        </p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BedDouble size={13} className="text-slate-400" />
            {property.rooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} className="text-slate-400" />
            {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} className="text-slate-400" />
            {property.netArea} m²
          </span>
          {property.grossArea !== property.netArea && (
            <span className="ml-auto text-slate-400">Brüt {property.grossArea} m²</span>
          )}
        </div>

        {/* Detail link */}
        <Link
          to={`/properties/${property.slug}`}
          className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
        >
          <span>Detayları Gör</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  )
}
