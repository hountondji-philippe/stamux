export interface InternProject {
  id: string
  title: string
  description: string
  progress: number
  status: string
  evaluation_score: number | null
}

export interface InternTask {
  id: string
  title: string
  project_id: string
  due_date: string | null
  status: string
}

export interface InternProjectsOverview {
  projects: InternProject[]
  tasks: InternTask[]
}

export interface ProfileOverviewStats {
  stagiaires: number
  rapports_valides: number
  note_moyenne: number | null
}

export interface ProfileActivityItem {
  action: string
  target_type: string | null
  created_at: string | null
}

export interface ProfileOverview {
  stats: ProfileOverviewStats | null
  recent_activity: ProfileActivityItem[]
}