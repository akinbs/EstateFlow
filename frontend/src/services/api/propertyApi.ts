import axiosClient from './axiosClient'
import type { PaginatedResponse } from '../../types/common'
import type {
  Property,
  PropertyCreatePayload,
  PropertyFilters,
  PropertyListItem,
  PropertyUpdatePayload,
} from '../../types/property'

const BASE = '/properties'

function buildParams(filters: PropertyFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.listingType) params.listingType = filters.listingType
  if (filters.propertyType) params.propertyType = filters.propertyType
  if (filters.city) params.city = filters.city
  if (filters.district) params.district = filters.district
  if (filters.neighborhood) params.neighborhood = filters.neighborhood
  if (filters.priceMin !== undefined) params.priceMin = filters.priceMin
  if (filters.priceMax !== undefined) params.priceMax = filters.priceMax
  if (filters.rooms?.length) params.rooms = filters.rooms.join(',')
  if (filters.featured !== undefined) params.featured = filters.featured
  if (filters.status) params.status = filters.status
  if (filters.sortBy) params.sortBy = filters.sortBy
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  return params
}

export async function getProperties(
  filters: PropertyFilters = {},
): Promise<PaginatedResponse<PropertyListItem>> {
  const { data } = await axiosClient.get<PaginatedResponse<PropertyListItem>>(BASE, {
    params: buildParams(filters),
  })
  return data
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyListItem[]> {
  const result = await getProperties({ featured: true, status: 'active', limit })
  return result.data
}

export async function getPropertyBySlug(slug: string): Promise<Property> {
  const { data } = await axiosClient.get<Property>(`${BASE}/${slug}`)
  return data
}

export async function getPropertyById(propertyId: string): Promise<Property> {
  const { data } = await axiosClient.get<Property>(`${BASE}/id/${propertyId}`)
  return data
}

export async function createProperty(payload: PropertyCreatePayload): Promise<Property> {
  const { data } = await axiosClient.post<Property>(BASE, payload)
  return data
}

export async function updateProperty(
  propertyId: string,
  payload: PropertyUpdatePayload,
): Promise<Property> {
  const { data } = await axiosClient.put<Property>(`${BASE}/${propertyId}`, payload)
  return data
}

export async function deleteProperty(propertyId: string): Promise<{ message: string }> {
  const { data } = await axiosClient.delete<{ message: string }>(`${BASE}/${propertyId}`)
  return data
}
