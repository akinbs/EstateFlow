import axiosClient from './axiosClient'
import type { PaginatedResponse } from '../../types/common'
import type { Lead, LeadCreatePayload, LeadUpdatePayload } from '../../types/lead'

const BASE = '/leads'

export async function createLead(payload: LeadCreatePayload): Promise<Lead> {
  const { data } = await axiosClient.post<Lead>(BASE, payload)
  return data
}

export async function getLeads(params?: {
  page?: number
  limit?: number
  status?: string
  propertyId?: string
}): Promise<PaginatedResponse<Lead>> {
  const { data } = await axiosClient.get<PaginatedResponse<Lead>>(BASE, { params })
  return data
}

export async function getLeadById(leadId: string): Promise<Lead> {
  const { data } = await axiosClient.get<Lead>(`${BASE}/${leadId}`)
  return data
}

export async function updateLead(leadId: string, payload: LeadUpdatePayload): Promise<Lead> {
  const { data } = await axiosClient.patch<Lead>(`${BASE}/${leadId}`, payload)
  return data
}
