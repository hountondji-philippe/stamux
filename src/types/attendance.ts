export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface Attendance {
  id: string
  intern_id: string
  internship_id: string
  date: string
  status: AttendanceStatus
  arrival_time: string | null
  departure_time: string | null
  latitude: number | null
  longitude: number | null
  late_reason: string | null
  note: string | null
}