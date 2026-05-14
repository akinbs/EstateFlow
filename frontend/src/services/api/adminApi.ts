import axiosClient from './axiosClient'
import type { PaginatedResponse } from '../../types/common'
import type {
  Property,
  PropertyListItem,
  PropertyCreatePayload,
  PropertyUpdatePayload,
  PropertyStatus,
} from '../../types/property'
import type { Lead, LeadStatus } from '../../types/lead'

export interface AdminStats {
  totalProperties: number
  activeProperties: number
  passiveProperties: number
  featuredProperties: number
  totalLeads: number
  newLeads: number
  requestedBy?: string
}

const ADMIN = '/admin'
const PROPS = '/properties'
const LEADS = '/leads'

// ── Stats ─────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await axiosClient.get<AdminStats>(`${ADMIN}/stats`)
  return data
}

// ── Properties (admin) ────────────────────────────────────────────────────

export async function getAdminProperties(params?: {
  status?: string
  page?: number
  limit?: number
  sortBy?: string
}): Promise<PaginatedResponse<PropertyListItem>> {
  const { data } = await axiosClient.get<PaginatedResponse<PropertyListItem>>(
    `${ADMIN}/properties`,
    { params },
  )
  return data
}

export async function getAdminPropertyById(propertyId: string): Promise<Property> {
  const { data } = await axiosClient.get<Property>(`${PROPS}/id/${propertyId}`)
  return data
}

export async function createProperty(payload: PropertyCreatePayload): Promise<Property> {
  const { data } = await axiosClient.post<Property>(PROPS, payload)
  return data
}

export async function updateProperty(
  propertyId: string,
  payload: PropertyUpdatePayload,
): Promise<Property> {
  const { data } = await axiosClient.put<Property>(`${PROPS}/${propertyId}`, payload)
  return data
}

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
): Promise<Property> {
  const { data } = await axiosClient.patch<Property>(`${PROPS}/${propertyId}/status`, { status })
  return data
}

export async function updatePropertyFeatured(
  propertyId: string,
  featured: boolean,
): Promise<Property> {
  const { data } = await axiosClient.patch<Property>(`${PROPS}/${propertyId}/featured`, { featured })
  return data
}

export async function deleteAdminProperty(propertyId: string): Promise<{ message: string }> {
  const { data } = await axiosClient.delete<{ message: string }>(`${PROPS}/${propertyId}`)
  return data
}

// ── Leads (admin) ─────────────────────────────────────────────────────────

export async function getAdminLeads(params?: {
  page?: number
  limit?: number
  status?: string
}): Promise<PaginatedResponse<Lead>> {
  const { data } = await axiosClient.get<PaginatedResponse<Lead>>(LEADS, { params })
  return data
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
  const { data } = await axiosClient.patch<Lead>(`${LEADS}/${leadId}`, { status })
  return data
}
