export type UserRole = 'user' | 'agent' | 'admin'

export interface AppUser {
  id: string
  email: string
  displayName: string
  photoURL: string | null
  role: UserRole
  phone?: string
  createdAt: string
  updatedAt: string
}
