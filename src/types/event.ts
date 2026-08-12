export type EventAudience = 'all' | 'interns' | 'mentors'

export interface Event {
  id: string
  author?: { id: string; name: string } | null
  title: string
  content: string
  image_url: string | null
  audience: EventAudience
  is_pinned: boolean
  published_at: string | null
  created_at: string | null
}