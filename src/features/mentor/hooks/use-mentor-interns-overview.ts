import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { MentorInternOverview } from '../../../types/mentor-intern-overview'

interface OverviewResponse {
  success: boolean
  data: MentorInternOverview[]
}

async function fetchOverview(): Promise<OverviewResponse> {
  const response = await apiClient.get<OverviewResponse>('/internships/mentor-overview')
  return response.data
}

export function useMentorInternsOverview() {
  return useQuery({
    queryKey: ['internships', 'mentor-overview'],
    queryFn: fetchOverview,
  })
}