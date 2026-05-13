import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import type { PropertyListItem } from '../../types/property'
import { createPriceMarkerIcon } from './mapIcons'
import { formatMarkerPrice } from './mapUtils'
import PropertyMapPopup from './PropertyMapPopup'

interface PropertyMarkerProps {
  property: PropertyListItem
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export default function PropertyMarker({
  property,
  isSelected = false,
  onSelect,
}: PropertyMarkerProps) {
  const priceLabel = formatMarkerPrice(property.price, property.currency)

  const icon = useMemo(
    () => createPriceMarkerIcon(priceLabel, isSelected),
    [priceLabel, isSelected],
  )

  return (
    <Marker
      position={[property.location.lat, property.location.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect?.(property.id),
      }}
    >
      <Popup className="property-popup" maxWidth={256} minWidth={240}>
        <PropertyMapPopup property={property} />
      </Popup>
    </Marker>
  )
}
