import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PropertyListItem } from '../../types/property'
import {
  getValidPropertiesWithLocation,
  getMapCenter,
  getBoundsFromProperties,
  ISTANBUL_CENTER,
  DEFAULT_ZOOM,
  type BoundsArray,
} from './mapUtils'
import { fixLeafletDefaultIcon } from './mapIcons'
import PropertyMarker from './PropertyMarker'

// Fix Leaflet default icon on module load (Vite-safe)
fixLeafletDefaultIcon()

// ── FitBoundsToProperties ─────────────────────────────────────────────────────
// Inner component: accesses the map instance and fits bounds when data changes.
function FitBoundsToProperties({ bounds }: { bounds: BoundsArray | null }) {
  const map = useMap()
  const prevKey = useRef('')

  useEffect(() => {
    const key = bounds ? bounds.flat(1).join(',') : 'empty'
    if (key === prevKey.current) return
    prevKey.current = key

    try {
      if (bounds) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: true })
      } else {
        map.setView(ISTANBUL_CENTER, DEFAULT_ZOOM)
      }
    } catch {
      // Map might not be ready on first paint — safely ignored
    }
  // bounds değişince yeniden çalıştır (key karşılaştırması gereksiz re-zoom'u önler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds])

  return null
}

// ── MapView ───────────────────────────────────────────────────────────────────
interface MapViewProps {
  properties: PropertyListItem[]
  selectedPropertyId?: string | null
  onSelectProperty?: (id: string) => void
  height?: string
  className?: string
}

export default function MapView({
  properties,
  selectedPropertyId,
  onSelectProperty,
  height = '600px',
  className = '',
}: MapViewProps) {
  const validProperties = getValidPropertiesWithLocation(properties)
  const center = getMapCenter(properties)
  const bounds = getBoundsFromProperties(properties)

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validProperties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            isSelected={property.id === selectedPropertyId}
            onSelect={onSelectProperty}
          />
        ))}

        <FitBoundsToProperties bounds={bounds} />
      </MapContainer>

      {/* Empty-state overlay (konumlu ilan yok) */}
      {!bounds && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-6">
          <p className="rounded-xl bg-white/90 px-4 py-2 text-xs font-medium text-slate-600 shadow-md backdrop-blur-sm">
            Bu filtrelerde haritada gösterilecek konumlu ilan bulunamadı.
          </p>
        </div>
      )}

      {/* Marker count badge */}
      {validProperties.length > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[999]">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow backdrop-blur-sm">
            {validProperties.length}/{properties.length} ilan haritada
          </span>
        </div>
      )}
    </div>
  )
}
