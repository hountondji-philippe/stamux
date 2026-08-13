import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { AdminUserOverview } from '../../../types/admin-overview'
import type { User } from '../../../types/user'

interface OverviewResponse {
  success: boolean
  data: AdminUserOverview
}

interface UserResponse {
  success: boolean
  data: User
}

interface RatePayload {
  admin_rating: number
  admin_rating_comment?: string | null
}

async function fetchUserOverview(id: string): Promise<OverviewResponse> {
  const response = await apiClient.get<OverviewResponse>(`/admin/users/${id}/overview`)
  return response.data
}

async function fetchUser(id: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/admin/users/${id}`)
  return response.data
}

async function rateUser(id: string, payload: RatePayload): Promise<UserResponse> {
  const response = await apiClient.patch<UserResponse>(`/admin/users/${id}/rate`, payload)
  return response.data
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

export function useAdminUserOverview(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id, 'overview'],
    queryFn: () => fetchUserOverview(id),
    enabled: !!id,
  })
}

export function useRateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RatePayload) => rateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}