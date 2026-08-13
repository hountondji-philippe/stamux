export interface MentorInternOverview {
  internship_id: string
  intern: {
    id: string
    name: string
    email: string
    avatar_path: string | null
  }
  presence_percent: number | null
  tasks_done: number
  tasks_total: number
  average_note: number | null
  progress_percent: number | null
}