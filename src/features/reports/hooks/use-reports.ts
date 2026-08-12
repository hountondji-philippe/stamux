import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Report } from '../../../types/report'

interface SubmitReportPayload {
  type: string
  period_start: string
  period_end: string
  file: File
}

interface ReviewReportPayload {
  id: string
  status: 'validated' | 'rejected'
  mentor_comment?: string
}

interface ReportResponse {
  success: boolean
  data: Report
}

interface ReportListResponse {
  success: boolean
  data: Report[]
}

async function submitReport(payload: SubmitReportPayload): Promise<ReportResponse> {
  const formData = new FormData()
  formData.append('type', payload.type)
  formData.append('period_start', payload.period_start)
  formData.append('period_end', payload.period_end)
  formData.append('file', payload.file)

  const response = await apiClient.post<ReportResponse>('/reports', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

async function fetchHistory(): Promise<ReportListResponse> {
  const response = await apiClient.get<ReportListResponse>('/reports')
  return response.data
}

async function fetchPending(): Promise<ReportListResponse> {
  const response = await apiClient.get<ReportListResponse>('/reports/pending')
  return response.data
}

async function reviewReport({ id, ...payload }: ReviewReportPayload): Promise<ReportResponse> {
  const response = await apiClient.post<ReportResponse>(`/reports/${id}/validate`, payload)
  return response.data
}

async function getDownloadUrl(id: string): Promise<string> {
  const response = await apiClient.get<{ success: boolean; data: { url: string } }>(
    `/reports/${id}/download`
  )
  return response.data.data.url
}

export function useReportHistory() {
  return useQuery({
    queryKey: ['reports', 'history'],
    queryFn: fetchHistory,
  })
}

export function usePendingReports() {
  return useQuery({
    queryKey: ['reports', 'pending'],
    queryFn: fetchPending,
  })
}

export function useSubmitReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useReviewReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reviewReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/reports/${id}`)
}

export function useDeleteReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: getDownloadUrl,
    onSuccess: (url) => {
      window.open(url, '_blank')
    },
  })
}