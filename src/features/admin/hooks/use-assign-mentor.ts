import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

interface AssignMentorPayload {
  internId: string
  mentorId: string
}

async function assignMentor({ internId, mentorId }: AssignMentorPayload) {
  const response = await apiClient.post(`/admin/users/${internId}/assign-mentor`, {
    mentor_id: mentorId,
  })
  return response.data
}

export function useAssignMentor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignMentor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}