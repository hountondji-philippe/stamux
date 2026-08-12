import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { CreateUserPayload } from '../../../types/create-user'
import type { User } from '../../../types/user'

interface CreateUserResponse {
  success: boolean
  data: User
}

async function createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
  const response = await apiClient.post<CreateUserResponse>('/admin/users', payload)
  return response.data
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}