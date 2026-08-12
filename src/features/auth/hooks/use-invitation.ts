import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

interface InvitationCheckResponse {
  success: boolean
  data: {
    name: string
    email: string
    role: string
  }
}

interface AcceptInvitationPayload {
  token: string
  password: string
  password_confirmation: string
}

async function checkInvitation(token: string): Promise<InvitationCheckResponse> {
  const response = await apiClient.get<InvitationCheckResponse>(`/auth/invitation/${token}`)
  return response.data
}

async function acceptInvitation(payload: AcceptInvitationPayload) {
  const response = await apiClient.post('/auth/invitation/accept', payload)
  return response.data
}

export function useInvitationCheck(token: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => checkInvitation(token),
    retry: false,
  })
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: acceptInvitation,
  })
}