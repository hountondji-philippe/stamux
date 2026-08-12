
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface RolePermissionRow {
  id: string
  role: 'admin' | 'mentor' | 'intern'
  permission_key: string
  label: string
  description: string | null
  enabled: boolean
  is_dynamic: boolean
}

interface RolePermissionsResponse {
  success: boolean
  data: RolePermissionRow[]
}

async function fetchRolePermissions(): Promise<RolePermissionsResponse> {
  const response = await apiClient.get<RolePermissionsResponse>('/admin/role-permissions')
  return response.data
}

interface UpdatePayload {
  id: string
  enabled: boolean
}

async function updateRolePermission({ id, enabled }: UpdatePayload): Promise<RolePermissionsResponse> {
  const response = await apiClient.patch<RolePermissionsResponse>(`/admin/role-permissions/${id}`, { enabled })
  return response.data
}

export function useRolePermissions() {
  return useQuery({ queryKey: ['admin', 'role-permissions'], queryFn: fetchRolePermissions })
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRolePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'role-permissions'] })
    },
  })
}