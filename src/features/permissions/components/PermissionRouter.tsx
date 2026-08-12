import { useAuthStore } from '../../../store/auth-store'
import { PermissionInternPage } from './PermissionInternPage'
import { PermissionReviewPage } from './PermissionReviewPage'

export function PermissionRouter() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'intern') {
    return <PermissionInternPage />
  }

  if (role === 'mentor') {
    return <PermissionReviewPage />
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      Ce module est reserve aux mentors et aux stagiaires.
    </div>
  )
}