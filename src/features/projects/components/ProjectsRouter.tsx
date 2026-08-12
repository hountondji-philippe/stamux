import { useAuthStore } from '../../../store/auth-store'
import { ProjectsInternPage } from './ProjectsInternPage'
import { ProjectsMentorPage } from './ProjectsMentorPage'
import { ProjectsAdminPage } from './ProjectsAdminPage'

export function ProjectsRouter() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'intern') return <ProjectsInternPage />
  if (role === 'mentor') return <ProjectsMentorPage />
  return <ProjectsAdminPage />
}