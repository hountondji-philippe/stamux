import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Internship } from '../../../types/internship'

interface InternshipsResponse {
  success: boolean
  data: Internship[]
}

async function fetchInternships(): Promise<InternshipsResponse> {
  const response = await apiClient.get<InternshipsResponse>('/internships')
  return response.data
}

export function useInternships() {
  return useQuery({
    queryKey: ['internships'],
    queryFn: fetchInternships,
  })
}