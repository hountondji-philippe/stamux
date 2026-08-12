import { useAuthStore } from '../../../store/auth-store'
import { AttendancePage } from './AttendancePage'
import { AttendanceDashboardPage } from './AttendanceDashboardPage'

export function AttendanceRouter() {
  const role = useAuthStore((state) => state.user?.role)

  if (role === 'intern') {
    return <AttendancePage />
  }

  return <AttendanceDashboardPage />
}