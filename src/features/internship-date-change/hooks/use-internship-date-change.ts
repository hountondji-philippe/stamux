import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface InternshipDateChangeRequestItem {
  id: string
  internship_id: string
  intern: { id: string; name: string; email: string }
  requested_start_date: string
  requested_end_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_comment: string | null
  reviewed_at: string | null
  created_at: string
}

interface RequestDateChangePayload {
  requested_start_date: string
  requested_end_date: string
  reason: string
}

interface ReviewDateChangePayload {
  id: string
  status: 'approved' | 'rejected'
  admin_comment?: string
}

interface DateChangeResponse {
  success: boolean
  data: InternshipDateChangeRequestItem
}

interface DateChangeListResponse {
  success: boolean
  data: InternshipDateChangeRequestItem[]
}

async function requestDateChange(payload: RequestDateChangePayload): Promise<DateChangeResponse> {
  const response = await apiClient.post<DateChangeResponse>('/internship-date-changes', payload)
  return response.data
}

async function fetchHistory(): Promise<DateChangeListResponse> {
  const response = await apiClient.get<DateChangeListResponse>('/internship-date-changes')
  return response.data
}

async function fetchPending(): Promise<DateChangeListResponse> {
  const response = await apiClient.get<DateChangeListResponse>('/internship-date-changes/pending')
  return response.data
}

async function reviewDateChange({ id, ...payload }: ReviewDateChangePayload): Promise<DateChangeResponse> {
  const response = await apiClient.post<DateChangeResponse>(`/internship-date-changes/${id}/review`, payload)
  return response.data
}

export function useDateChangeHistory() {
  return useQuery({
    queryKey: ['internship-date-changes', 'history'],
    queryFn: fetchHistory,
  })
}

export function usePendingDateChanges() {
  return useQuery({
    queryKey: ['internship-date-changes', 'pending'],
    queryFn: fetchPending,
  })
}

export function useRequestDateChange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestDateChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internship-date-changes'] })
    },
  })
}

export function useReviewDateChange() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewDateChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internship-date-changes'] })
    },
  })
}