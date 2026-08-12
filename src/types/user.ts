export type Role = 'intern' | 'mentor' | 'admin'
export type UserStatus = 'pending' | 'active'| 'inactive'
export type Theme = 'light' | 'dark' | 'auto'
export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  language: string
  timezone: string
  role: Role
  status: UserStatus
  avatar_path: string | null
  mfa_enabled: boolean
  notify_email: boolean
  notify_push: boolean
  notify_attendance_reminder: boolean
  theme: Theme
  created_at: string | null
  assigned_mentor?: { id: string; name: string } | null
}