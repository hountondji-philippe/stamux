import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { StamuxDocument, DocumentType } from '../../../types/document'

interface DocResponse {
  success: boolean
  data: StamuxDocument
}
interface DocListResponse {
  success: boolean
  data: StamuxDocument[]
}

async function fetchHistory(): Promise<DocListResponse> {
  const response = await apiClient.get<DocListResponse>('/documents')
  return response.data
}

async function fetchPendingMentor(): Promise<DocListResponse> {
  const response = await apiClient.get<DocListResponse>('/documents/pending')
  return response.data
}

async function fetchPendingAdmin(): Promise<DocListResponse> {
  const response = await apiClient.get<DocListResponse>('/admin/documents/pending')
  return response.data
}

async function requestDocument(payload: { type: DocumentType; request_note?: string }): Promise<DocResponse> {
  const response = await apiClient.post<DocResponse>('/documents/request', payload)
  return response.data
}

async function mentorValidate(payload: { id: string; status: 'approved' | 'rejected'; rejection_reason?: string }) {
  const { id, ...rest } = payload
  const response = await apiClient.post<DocResponse>(`/documents/${id}/mentor-validate`, rest)
  return response.data
}

async function uploadFinal(payload: { id: string; file: File }) {
  const formData = new FormData()
  formData.append('file', payload.file)
  const response = await apiClient.post<DocResponse>(`/documents/${payload.id}/upload`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

async function adminReject(payload: { id: string; rejection_reason: string }) {
  const { id, ...rest } = payload
  const response = await apiClient.post<DocResponse>(`/documents/${id}/reject`, rest)
  return response.data
}

async function getDownloadUrl(id: string): Promise<string> {
  const response = await apiClient.get<{ success: boolean; data: { url: string } }>(`/documents/${id}/download`)
  return response.data.data.url
}

async function downloadFileBlob(id: string): Promise<{ blob: Blob; filename: string }> {
  const response = await apiClient.get(`/documents/${id}/download-file`, { responseType: 'blob' })
  const disposition = response.headers['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="?([^"]+)"?/)
  const filename = match?.[1] ?? 'document.pdf'
  return { blob: response.data as Blob, filename }
}

export function useDocumentHistory() {
  return useQuery({ queryKey: ['documents', 'history'], queryFn: fetchHistory })
}

export function usePendingMentorDocuments() {
  return useQuery({ queryKey: ['documents', 'pending-mentor'], queryFn: fetchPendingMentor })
}

export function usePendingAdminDocuments() {
  return useQuery({ queryKey: ['documents', 'pending-admin'], queryFn: fetchPendingAdmin })
}

export function useRequestDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useMentorValidateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mentorValidate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useUploadFinalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadFinal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useAdminRejectDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminReject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

async function editDocument(payload: { id: string; request_note?: string }) {
  const { id, ...rest } = payload
  const response = await apiClient.patch<DocResponse>(`/documents/${id}`, rest)
  return response.data
}

async function deleteDocument(id: string) {
  await apiClient.delete(`/documents/${id}`)
}

export function useEditDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: editDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: getDownloadUrl,
    onSuccess: (url) => {
      window.open(url, '_blank')
    },
  })
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: downloadFileBlob,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
  })
}