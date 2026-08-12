import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import { useAuthStore } from '../../../store/auth-store'
import type { User } from '../../../types/user'

interface MeResponse {
  success: boolean
  data: User
}

async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/me')
  return response.data
}

export function useMe() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
  })
}