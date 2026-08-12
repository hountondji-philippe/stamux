export interface Internship {
  id: string
  intern?: { id: string; name: string; email: string }
  mentor?: { id: string; name: string }
  start_date: string
  end_date: string
  duration_days: number
  status: 'active' | 'terminated' | 'completed'
  termination_reason: string | null
}