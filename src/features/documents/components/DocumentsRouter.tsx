import { useAuthStore } from '../../../store/auth-store'
import { DocumentInternPage } from './DocumentInternPage'
import { DocumentMentorPage } from './DocumentMentorPage'
import { DocumentAdminPage } from './DocumentAdminPage'

export function DocumentsRouter() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'intern') return <DocumentInternPage />
  if (role === 'mentor') return <DocumentMentorPage />
  return <DocumentAdminPage />
}