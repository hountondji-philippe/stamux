import { useAuthStore } from '../../../store/auth-store'
import { ReportInternPage } from './ReportInternPage'
import { ReportReviewPage } from './ReportReviewPage'
import { ReportAdminPage } from './ReportAdminPage'

export function ReportRouter() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'intern') return <ReportInternPage />
  if (role === 'mentor') return <ReportReviewPage />
  return <ReportAdminPage />
}