import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Attendance } from '../../../types/attendance'

interface DashboardStats {
  total: number
  present_rate: number
  absent_rate: number
  late_rate: number
}

interface DashboardResponse {
  success: boolean
  data: {
    attendances: (Attendance & { intern?: { id: string; name: string } })[]
    stats: DashboardStats
  }
}

async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/attendance/dashboard')
  return response.data
}

export function useAttendanceDashboard() {
  return useQuery({
    queryKey: ['attendance', 'dashboard'],
    queryFn: fetchDashboard,
  })
}