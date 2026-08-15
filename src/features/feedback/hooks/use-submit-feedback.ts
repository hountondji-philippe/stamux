import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface SubmitFeedbackPayload {
  welcome_rating: number
  mentorship_rating: number
  atmosphere_rating: number
  professional_value_rating: number
  recommendation_score: number
  comment?: string
  is_anonymous?: boolean
}

async function submitFeedback(payload: SubmitFeedbackPayload) {
  const response = await apiClient.post('/feedback', payload)
  return response.data
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'internship-feedbacks'] })
    },
  })
}
