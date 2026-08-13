export interface AdminInternOverviewItem {
  internship_id: string
  intern: { id: string; name: string; email: string }
  presence_percent: number | null
  average_note: number | null
}

export interface AdminMentorOverview {
  role: 'mentor'
  interns: AdminInternOverviewItem[]
  mentorship_rating_avg: number | null
}

export interface AdminAttendanceItem {
  id: string
  date: string
  arrival_time: string | null
  departure_time: string | null
  status: string
}

export interface AdminReportItem {
  id: string
  type: string
  period_start: string
  period_end: string
  status: string
}

export interface AdminProjectItem {
  id: string
  title: string
  description: string
  progress: number
  status: string
  evaluation_score: number | null
}

export interface AdminTaskItem {
  id: string
  title: string
  project_id: string
  due_date: string | null
  status: string
}

export interface AdminInternOverview {
  role: 'intern'
  internship: { id: string; start_date: string; end_date: string; status: string } | null
  attendances: AdminAttendanceItem[]
  reports: AdminReportItem[]
  projects: AdminProjectItem[]
  tasks: AdminTaskItem[]
}

export interface AdminBasicOverview {
  role: 'admin'
}

export type AdminUserOverview = AdminMentorOverview | AdminInternOverview | AdminBasicOverview