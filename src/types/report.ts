export type ReportType = 'weekly' | 'monthly'
export type ReportStatus = 'pending' | 'validated' | 'rejected'

export interface Report {
  id: string
  intern?: { id: string; name: string }
  type: ReportType
  period_start: string
  period_end: string
  file_name: string
  file_size: number
  status: ReportStatus
  mentor_comment: string | null
  validated_at: string | null
}