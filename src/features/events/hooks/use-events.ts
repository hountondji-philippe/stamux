import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import type { Event, EventAudience } from '../../../types/event'

interface EventsResponse {
  success: boolean
  data: Event[]
  meta?: { total: number; current_page: number; last_page: number }
}

interface EventResponse {
  success: boolean
  data: Event
}

interface CreateEventPayload {
  title: string
  content: string
  audience: EventAudience
  is_pinned?: boolean
  image?: File
}

interface UpdateEventPayload {
  id: string
  title?: string
  content?: string
  audience?: EventAudience
  is_pinned?: boolean
  image?: File
  removeImage?: boolean
}

async function fetchEvents(): Promise<EventsResponse> {
  const response = await apiClient.get<EventsResponse>('/events')
  return response.data
}

function buildFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')
    } else {
      formData.append(key, value as string | Blob)
    }
  })
  return formData
}

async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  if (payload.image) {
    const formData = buildFormData(payload)
    const response = await apiClient.post<EventResponse>('/events', formData, {
      headers: { 'Content-Type': undefined },
    })
    return response.data
  }
  const { image, ...rest } = payload
  const response = await apiClient.post<EventResponse>('/events', rest)
  return response.data
}

async function updateEvent({ id, image, removeImage, ...payload }: UpdateEventPayload): Promise<EventResponse> {
  if (image) {
    const formData = buildFormData({ ...payload, image })
    formData.append('_method', 'PATCH')
    const response = await apiClient.post<EventResponse>(`/events/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return response.data
  }
  const response = await apiClient.patch<EventResponse>(`/events/${id}`, {
    ...payload,
    remove_image: removeImage || undefined,
  })
  return response.data
}

async function deleteEvent(id: string) {
  const response = await apiClient.delete(`/events/${id}`)
  return response.data
}

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: fetchEvents })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })
}