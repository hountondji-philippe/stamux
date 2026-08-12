import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { User } from '../../../types/user'

interface UsersResponse {
  success: boolean
  data: User[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

interface UseUsersParams {
  role?: string
  status?: string
  search?: string
}

async function fetchUsers(params: UseUsersParams): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>('/admin/users', { params })
  return response.data
}

export function useUsers(params: UseUsersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => fetchUsers(params),
  })
}