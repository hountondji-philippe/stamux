export type PermissionStatus = 'pending' | 'approved' | 'rejected'

export interface Permission {
  id: string
  intern?: { id: string; name: string }
  start_date: string
  end_date: string
  reason: string
  status: PermissionStatus
  mentor_comment: string | null
  reviewed_at: string | null
}