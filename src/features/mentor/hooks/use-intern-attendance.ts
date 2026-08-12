import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Attendance } from '../../../types/attendance'

interface AttendanceListResponse {
  success: boolean
  data: Attendance[]
}

async function fetchInternAttendance(internId: string): Promise<AttendanceListResponse> {
  const response = await apiClient.get<AttendanceListResponse>(`/attendance/${internId}`)
  return response.data
}

export function useInternAttendance(internId: string) {
  return useQuery({
    queryKey: ['attendance', 'intern', internId],
    queryFn: () => fetchInternAttendance(internId),
    enabled: !!internId,
  })
}