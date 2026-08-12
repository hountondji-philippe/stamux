import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Permission } from '../../../types/permission'

interface RequestPermissionPayload {
  start_date: string
  end_date: string
  reason: string
}

interface ReviewPermissionPayload {
  id: string
  status: 'approved' | 'rejected'
  mentor_comment?: string
}

interface PermissionResponse {
  success: boolean
  data: Permission
}

interface PermissionListResponse {
  success: boolean
  data: Permission[]
}

async function requestPermission(payload: RequestPermissionPayload): Promise<PermissionResponse> {
  const response = await apiClient.post<PermissionResponse>('/permissions', payload)
  return response.data
}

async function fetchHistory(): Promise<PermissionListResponse> {
  const response = await apiClient.get<PermissionListResponse>('/permissions')
  return response.data
}

async function fetchPending(): Promise<PermissionListResponse> {
  const response = await apiClient.get<PermissionListResponse>('/permissions/pending')
  return response.data
}

async function reviewPermission({ id, ...payload }: ReviewPermissionPayload): Promise<PermissionResponse> {
  const response = await apiClient.post<PermissionResponse>(`/permissions/${id}/review`, payload)
  return response.data
}

export function usePermissionHistory() {
  return useQuery({
    queryKey: ['permissions', 'history'],
    queryFn: fetchHistory,
  })
}

export function usePendingPermissions() {
  return useQuery({
    queryKey: ['permissions', 'pending'],
    queryFn: fetchPending,
  })
}

export function useRequestPermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export function useReviewPermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}