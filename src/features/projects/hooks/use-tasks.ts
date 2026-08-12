import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Task, TaskStatus } from '../../../types/task'

interface TasksResponse {
  success: boolean
  data: Task[]
}
interface TaskResponse {
  success: boolean
  data: Task
}

interface CreateTaskPayload {
  projectId: string
  title: string
  description?: string
  intern_ids: string[]
  due_date?: string
}

async function fetchTasks(projectId: string): Promise<TasksResponse> {
  const response = await apiClient.get<TasksResponse>(`/projects/${projectId}/tasks`)
  return response.data
}

async function createTask({ projectId, ...payload }: CreateTaskPayload): Promise<TaskResponse> {
  const response = await apiClient.post<TaskResponse>(`/projects/${projectId}/tasks`, payload)
  return response.data
}

async function updateMyStatus({ id, status }: { id: string; status: TaskStatus }) {
  const response = await apiClient.patch(`/tasks/${id}/my-status`, { status })
  return response.data
}

async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`)
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] })
    },
  })
}

export function useUpdateMyTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['projects'], exact: false })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })
}