import { Link } from 'react-router-dom'
import { Heart, MapPin, BedDouble, Bath, Maximize2, ArrowRight } from 'lucide-react'
import type { PropertyListItem } from '../../types/property'
import { formatPrice } from '../../utils/formatPrice'
import { cn } from '../../utils/cn'
import Badge from '../ui/Badge'
import { useFavoriteStore } from '../../features/favorites/favoriteStore'

interface PropertyListItemRowProps {
  property: PropertyListItem
  isSelected?: boolean
  onSelect?: (id: string) => void
}

const listingTypeBadge: Record<PropertyListItem['listingType'], 'info' | 'success'> = {
  sale: 'info',
  rent: 'success',
}
const listingTypeLabel: Record<PropertyListItem['listingType'], string> = {
  sale: 'Satılık',
  rent: 'Kiralık',
}

export default function PropertyListItemRow({
  property,
  isSelected = false,
  onSelect,
}: PropertyListItemRowProps) {
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const favorited = isFavorite(property.id)
  const mainImage = property.images[0]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(property.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.(property.id)}
      className={cn(
        'flex cursor-pointer gap-3 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-150',
        isSelected
          ? 'border-orange-400 ring-2 ring-orange-200 shadow-md'
          : 'border-slate-100 hover:border-slate-200 hover:shadow-md',
      )}
    >
      {/* Image */}
      <Link
        to={`/properties/${property.slug}`}
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt ?? property.title}
            className="h-28 w-36 rounded-l-2xl object-cover sm:w-44"
            loading="lazy"
          />
        ) : (
          <div className="flex h-28 w-36 items-center justify-center rounded-l-2xl bg-slate-100 text-xs text-slate-300 sm:w-44">
            Fotoğraf yok
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-3 pr-3">
        {/* Top */}
        <div>
          <div className="mb-1 flex flex-wrap gap-1.5">
            <Badge variant={listingTypeBadge[property.listingType]}>
              {listingTypeLabel[property.listingType]}
            </Badge>
            {property.featured && <Badge variant="warning">Öne Çıkan</Badge>}
          </div>

          <Link
            to={`/properties/${property.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors hover:text-orange-600">
              {property.title}
            </h3>
          </Link>

          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}
              {property.district}, {property.city}
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <BedDouble size={12} />{property.rooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} />{property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={12} />{property.netArea} m²
          </span>
        </div>

        {/* Price + actions */}
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-slate-900">
              {formatPrice(property.price, property.currency)}
            </p>
            {property.listingType === 'rent' && (
              <span className="text-xs text-slate-400">/ay</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(property)
              }}
              aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg border transition-all',
                favorited
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400',
              )}
            >
              <Heart size={13} fill={favorited ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/properties/${property.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-600 transition-colors hover:border-orange-300 hover:text-orange-600"
            >
              Detay <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
