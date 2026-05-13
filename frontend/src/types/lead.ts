export type LeadStatus = 'new' | 'contacted' | 'closed'

/** Payload for POST /leads */
export interface LeadCreatePayload {
  propertyId: string
  propertyTitle?: string
  name: string
  email: string
  phone?: string
  message: string
}

/** Full lead response — matches backend LeadOut */
export interface Lead {
  id: string
  propertyId: string
  propertyTitle?: string | null
  name: string
  email: string
  phone?: string | null
  message: string
  status: LeadStatus
  userId?: string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

/** Payload for PATCH /leads/:id */
export interface LeadUpdatePayload {
  status?: LeadStatus
  notes?: string
}
