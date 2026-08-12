import type { Role } from './user'

export interface CreateUserPayload {
  name: string
  email: string
  role: Role
  start_date?: string
  end_date?: string
  mentor_id?: string
}