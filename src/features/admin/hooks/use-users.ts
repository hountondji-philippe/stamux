import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
async function resendInvitation(id: string) {
  const response = await apiClient.post(`/admin/users/${id}/resend-invitation`)
  return response.data
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: resendInvitation,
  })
}

async function deleteUser(id: string) {
  const response = await apiClient.delete(`/admin/users/${id}/delete-intern-data`)
  return response.data
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}