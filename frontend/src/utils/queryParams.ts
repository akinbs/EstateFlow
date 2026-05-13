import type {
  PropertyFilters,
  ListingType,
  PropertyType,
  PropertyStatus,
  PropertySortOption,
} from '../types/property'

const LISTING_TYPES = new Set<ListingType>(['sale', 'rent'])
const PROPERTY_TYPES = new Set<PropertyType>([
  'apartment', 'house', 'villa', 'land', 'office', 'commercial',
])
const PROPERTY_STATUSES = new Set<PropertyStatus>([
  'draft', 'active', 'passive', 'sold', 'rented',
])
const SORT_OPTIONS = new Set<PropertySortOption>([
  'date_desc', 'date_asc', 'price_asc', 'price_desc',
])

export function getFiltersFromSearchParams(searchParams: URLSearchParams): PropertyFilters {
  const filters: PropertyFilters = {}

  const listingType = searchParams.get('listingType')
  if (listingType && LISTING_TYPES.has(listingType as ListingType)) {
    filters.listingType = listingType as ListingType
  }

  const propertyType = searchParams.get('propertyType')
  if (propertyType && PROPERTY_TYPES.has(propertyType as PropertyType)) {
    filters.propertyType = propertyType as PropertyType
  }

  const status = searchParams.get('status')
  if (status && PROPERTY_STATUSES.has(status as PropertyStatus)) {
    filters.status = status as PropertyStatus
  }

  const sortBy = searchParams.get('sortBy')
  if (sortBy && SORT_OPTIONS.has(sortBy as PropertySortOption)) {
    filters.sortBy = sortBy as PropertySortOption
  }

  const city = searchParams.get('city')
  if (city) filters.city = city

  const district = searchParams.get('district')
  if (district) filters.district = district

  const neighborhood = searchParams.get('neighborhood')
  if (neighborhood) filters.neighborhood = neighborhood

  const priceMin = searchParams.get('priceMin')
  if (priceMin && !isNaN(Number(priceMin))) filters.priceMin = Number(priceMin)

  const priceMax = searchParams.get('priceMax')
  if (priceMax && !isNaN(Number(priceMax))) filters.priceMax = Number(priceMax)

  const rooms = searchParams.get('rooms')
  if (rooms) filters.rooms = rooms.split(',').filter(Boolean)

  const page = searchParams.get('page')
  if (page && !isNaN(Number(page))) filters.page = Math.max(1, Number(page))

  const limit = searchParams.get('limit')
  if (limit && !isNaN(Number(limit))) filters.limit = Math.min(50, Math.max(1, Number(limit)))

  return filters
}

export function buildSearchParamsFromFilters(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.listingType) params.set('listingType', filters.listingType)
  if (filters.propertyType) params.set('propertyType', filters.propertyType)
  if (filters.city) params.set('city', filters.city)
  if (filters.district) params.set('district', filters.district)
  if (filters.neighborhood) params.set('neighborhood', filters.neighborhood)
  if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin))
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax))
  if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','))
  if (filters.sortBy && filters.sortBy !== 'date_desc') params.set('sortBy', filters.sortBy)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))
  if (filters.limit && filters.limit !== 12) params.set('limit', String(filters.limit))
  if (filters.status) params.set('status', filters.status)

  return params
}
