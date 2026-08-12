import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Project } from '../../../types/project'

interface ProjectsResponse {
  success: boolean
  data: Project[]
}
interface ProjectResponse {
  success: boolean
  data: Project
}

interface CreateProjectPayload {
  title: string
  description: string
  objectives?: string
  deliverables?: string
  start_date: string
  end_date?: string
}

interface EvaluatePayload {
  projectId: string
  internId: string
  score: number
  comment?: string
}

async function fetchProjects(): Promise<ProjectsResponse> {
  const response = await apiClient.get<ProjectsResponse>('/projects')
  return response.data
}

async function fetchProject(id: string): Promise<ProjectResponse> {
  const response = await apiClient.get<ProjectResponse>(`/projects/${id}`)
  return response.data
}

async function createProject(payload: CreateProjectPayload): Promise<ProjectResponse> {
  const response = await apiClient.post<ProjectResponse>('/projects', payload)
  return response.data
}

async function assignInterns({ id, intern_ids }: { id: string; intern_ids: string[] }): Promise<ProjectResponse> {
  const response = await apiClient.post<ProjectResponse>(`/projects/${id}/assign`, { intern_ids })
  return response.data
}

async function evaluateIntern({ projectId, internId, score, comment }: EvaluatePayload) {
  const response = await apiClient.post(`/projects/${projectId}/evaluate/${internId}`, { score, comment })
  return response.data
}

async function updateProgress({ id, progress }: { id: string; progress: number }): Promise<ProjectResponse> {
  const response = await apiClient.patch<ProjectResponse>(`/projects/${id}/progress`, { progress })
  return response.data
}

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: fetchProjects })
}

export function useProject(id: string) {
  return useQuery({ queryKey: ['projects', id], queryFn: () => fetchProject(id), enabled: !!id })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useAssignInterns() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignInterns,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useEvaluateIntern() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: evaluateIntern,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] })
    },
  })
}

export function useUpdateProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProgress,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}