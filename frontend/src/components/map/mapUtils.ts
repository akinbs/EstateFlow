import type { PropertyListItem } from '../../types/property'

export type BoundsArray = [[number, number], [number, number]]

export const ISTANBUL_CENTER: [number, number] = [41.0082, 28.9784]
const DEFAULT_ZOOM = 11

export function isValidLocation(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    !(lat === 0 && lng === 0) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

export function getValidPropertiesWithLocation(
  properties: PropertyListItem[],
): PropertyListItem[] {
  return properties.filter(
    (p) => p.location && isValidLocation(p.location.lat, p.location.lng),
  )
}

export function getMapCenter(properties: PropertyListItem[]): [number, number] {
  const valid = getValidPropertiesWithLocation(properties)
  if (valid.length === 0) return ISTANBUL_CENTER

  const avgLat = valid.reduce((s, p) => s + p.location.lat, 0) / valid.length
  const avgLng = valid.reduce((s, p) => s + p.location.lng, 0) / valid.length
  return [avgLat, avgLng]
}

export function getBoundsFromProperties(
  properties: PropertyListItem[],
): BoundsArray | null {
  const valid = getValidPropertiesWithLocation(properties)
  if (valid.length === 0) return null

  const lats = valid.map((p) => p.location.lat)
  const lngs = valid.map((p) => p.location.lng)

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}

export function formatMarkerPrice(price: number, currency: string): string {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺'

  if (price >= 1_000_000) {
    const m = price / 1_000_000
    return `${sym}${Number.isInteger(m) ? m : m.toFixed(1)}M`
  }
  if (price >= 1_000) {
    return `${sym}${Math.round(price / 1_000)}K`
  }
  return `${sym}${price}`
}

export { DEFAULT_ZOOM }
