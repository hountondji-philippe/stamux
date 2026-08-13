import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import { useAuthStore } from '../../../store/auth-store'
import type { ProfileOverview } from '../../../types/profile-overview'
import type { User } from '../../../types/user'

interface OverviewResponse {
  success: boolean
  data: ProfileOverview
}

interface MeResponse {
  success: boolean
  data: User
}

interface UpdateProfileDetailsPayload {
  name?: string
  phone?: string | null
  bio?: string | null
  company?: string | null
  department?: string | null
  availability?: boolean
  max_capacity?: number | null
}

async function fetchProfileOverview(): Promise<OverviewResponse> {
  const response = await apiClient.get<OverviewResponse>('/me/profile-overview')
  return response.data
}

async function updateProfileDetails(payload: UpdateProfileDetailsPayload): Promise<MeResponse> {
  const response = await apiClient.patch<MeResponse>('/me', payload)
  return response.data
}

export function useProfileOverview() {
  return useQuery({ queryKey: ['me', 'profile-overview'], queryFn: fetchProfileOverview })
}

export function useUpdateProfileDetails() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)
  return useMutation({
    mutationFn: updateProfileDetails,
    onSuccess: (data) => {
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}