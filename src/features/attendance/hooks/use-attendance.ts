import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Attendance } from '../../../types/attendance'

interface RecordAttendancePayload {
  latitude: number
  longitude: number
  late_reason?: string
  late_proof?: File
}

interface AttendanceResponse {
  success: boolean
  data: Attendance
}

interface HistoryResponse {
  success: boolean
  data: Attendance[]
}

async function recordAttendance(payload: RecordAttendancePayload): Promise<AttendanceResponse> {
  const formData = new FormData()
  formData.append('latitude', String(payload.latitude))
  formData.append('longitude', String(payload.longitude))
  if (payload.late_reason) formData.append('late_reason', payload.late_reason)
  if (payload.late_proof) formData.append('late_proof', payload.late_proof)

  const response = await apiClient.post<AttendanceResponse>('/attendance', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

async function recordDeparture(id: string): Promise<AttendanceResponse> {
  const response = await apiClient.patch<AttendanceResponse>(`/attendance/${id}/departure`)
  return response.data
}

async function fetchHistory(): Promise<HistoryResponse> {
  const response = await apiClient.get<HistoryResponse>('/attendance')
  return response.data
}

export function useAttendanceHistory() {
  return useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: fetchHistory,
  })
}

export function useRecordAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

export function useRecordDeparture() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordDeparture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}