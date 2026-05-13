import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Maximize2 } from 'lucide-react'
import type { PropertyListItem } from '../../types/property'
import { formatPrice } from '../../utils/formatPrice'

interface PropertyMapPopupProps {
  property: PropertyListItem
}

export default function PropertyMapPopup({ property }: PropertyMapPopupProps) {
  const mainImage = property.images[0]

  return (
    <div className="w-60 overflow-hidden">
      {/* Image */}
      {mainImage ? (
        <img
          src={mainImage.url}
          alt={mainImage.alt ?? property.title}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
          Fotoğraf yok
        </div>
      )}

      {/* Body */}
      <div className="p-3">
        {/* Price */}
        <p className="text-sm font-bold text-slate-900">
          {formatPrice(property.price, property.currency)}
          {property.listingType === 'rent' && (
            <span className="text-xs font-normal text-slate-400"> /ay</span>
          )}
        </p>

        {/* Title */}
        <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-700">
          {property.title}
        </p>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={10} className="shrink-0" />
          {property.district}, {property.city}
        </p>

        {/* Stats */}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-0.5">
            <BedDouble size={11} />
            {property.rooms}
          </span>
          <span className="flex items-center gap-0.5">
            <Maximize2 size={11} />
            {property.netArea} m²
          </span>
        </div>

        {/* Detail link */}
        <Link
          to={`/properties/${property.slug}`}
          className="mt-3 block w-full rounded-xl bg-orange-500 px-3 py-1.5 text-center text-xs font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Detayları Gör
        </Link>
      </div>
    </div>
  )
}
