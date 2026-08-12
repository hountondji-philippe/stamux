export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TaskIntern {
  id: string
  name: string
  email: string
  status: TaskStatus
  completed_at: string | null
}

export interface Task {
  id: string
  project_id: string
  created_by?: { id: string; name: string }
  title: string
  description: string | null
  due_date: string | null
  interns?: TaskIntern[]
  created_at: string | null
}