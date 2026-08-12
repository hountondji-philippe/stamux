import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth-store'
import { useMe } from '../features/auth/hooks/use-me'

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const { data, isLoading, isError } = useMe()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Chargement...
      </div>
    )
  }

  if (isError) {
    clearAuth()
    return <Navigate to="/login" replace />
  }

  if (data) {
    setAuth(data.data, token)
  }

  return <Outlet />
}