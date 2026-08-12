export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface ProjectIntern {
  id: string
  name: string
  email: string
  evaluation_score: number | null
  evaluation_comment: string | null
  assigned_at: string | null
}

export interface Project {
  id: string
  mentor?: { id: string; name: string }
  title: string
  description: string
  objectives: string | null
  deliverables: string | null
  progress: number
  start_date: string
  end_date: string | null
  status: ProjectStatus
  tasks_count?: number
  interns?: ProjectIntern[]
  created_at: string | null
}