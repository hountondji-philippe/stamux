import { useMutation } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import { useAuthStore } from '../../../store/auth-store'
import type { User } from '../../../types/user'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
}

async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token)
    },
  })
}