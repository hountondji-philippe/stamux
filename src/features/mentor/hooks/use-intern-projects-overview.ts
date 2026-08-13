import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { InternProjectsOverview } from '../../../types/profile-overview'

interface Response {
  success: boolean
  data: InternProjectsOverview
}

async function fetchOverview(internshipId: string): Promise<Response> {
  const response = await apiClient.get<Response>(`/internships/${internshipId}/projects-overview`)
  return response.data
}

export function useInternProjectsOverview(internshipId: string) {
  return useQuery({
    queryKey: ['internships', internshipId, 'projects-overview'],
    queryFn: () => fetchOverview(internshipId),
    enabled: !!internshipId,
  })
}