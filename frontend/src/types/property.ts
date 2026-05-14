export type ListingType = 'sale' | 'rent'

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'land'
  | 'office'
  | 'commercial'

export type PropertyStatus =
  | 'draft'
  | 'active'
  | 'passive'
  | 'sold'
  | 'rented'

export type Currency = 'TRY' | 'USD' | 'EUR'

export interface PropertyLocation {
  lat: number
  lng: number
}

export interface PropertyImage {
  url: string
  path?: string | null
  alt?: string | null
  sortOrder?: number
}

/** Full property detail — matches backend PropertyOut */
export interface Property {
  id: string
  title: string
  slug: string
  description: string
  listingType: ListingType
  propertyType: PropertyType
  price: number
  currency: Currency
  city: string
  district: string
  neighborhood: string
  addressText?: string | null
  location: PropertyLocation
  rooms: string
  bathrooms: number
  grossArea: number
  netArea: number
  buildingAge: number
  floor: number
  totalFloors: number
  heating: string
  furnished: boolean
  features: string[]
  images: PropertyImage[]
  status: PropertyStatus
  featured: boolean
  viewCount: number
  ownerId?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

/** Lightweight list card — matches backend PropertyListItem */
export interface PropertyListItem {
  id: string
  title: string
  slug: string
  listingType: ListingType
  propertyType: PropertyType
  price: number
  currency: Currency
  city: string
  district: string
  neighborhood: string
  location: PropertyLocation
  rooms: string
  bathrooms: number
  grossArea: number
  netArea: number
  images: PropertyImage[]
  status: PropertyStatus
  featured: boolean
  viewCount: number
  createdAt?: string | null
}

export type PropertySortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'

/** Query params for GET /properties */
export interface PropertyFilters {
  listingType?: ListingType
  propertyType?: PropertyType
  city?: string
  district?: string
  neighborhood?: string
  priceMin?: number
  priceMax?: number
  rooms?: string[]
  featured?: boolean
  status?: PropertyStatus
  sortBy?: PropertySortOption
  page?: number
  limit?: number
}

/** Payload for POST /properties */
export interface PropertyCreatePayload {
  title: string
  description?: string
  listingType: ListingType
  propertyType: PropertyType
  price: number
  currency?: Currency
  city: string
  district: string
  neighborhood?: string
  addressText?: string
  location: PropertyLocation
  rooms: string
  bathrooms?: number
  grossArea: number
  netArea: number
  buildingAge?: number
  floor?: number
  totalFloors?: number
  heating?: string
  furnished?: boolean
  features?: string[]
  images?: PropertyImage[]
  status?: PropertyStatus
  featured?: boolean
  slug?: string
}

/** Payload for PUT /properties/:id — all optional */
export type PropertyUpdatePayload = Partial<PropertyCreatePayload>

/** Form state for PropertyForm — all numeric/coord fields kept as strings for input binding */
export interface PropertyFormValues {
  title: string
  description: string
  listingType: ListingType
  propertyType: PropertyType
  price: string
  currency: Currency
  city: string
  district: string
  neighborhood: string
  addressText: string
  lat: string
  lng: string
  rooms: string
  bathrooms: string
  grossArea: string
  netArea: string
  buildingAge: string
  floor: string
  totalFloors: string
  heating: string
  furnished: boolean
  status: PropertyStatus
  featured: boolean
}

/**
 * Lightweight snapshot stored in compareStore (localStorage).
 * Detail fields (buildingAge etc.) are optional because the snapshot may come
 * from a list card (PropertyListItem) which doesn't carry them.
 */
export interface ComparePropertySnapshot {
  id: string
  title: string
  slug: string
  price: number
  currency: Currency
  listingType: ListingType
  propertyType: PropertyType
  city: string
  district: string
  neighborhood: string
  rooms: string
  bathrooms: number
  grossArea: number
  netArea: number
  images: PropertyImage[]
  buildingAge?: number
  floor?: number
  totalFloors?: number
  heating?: string
  furnished?: boolean
}
