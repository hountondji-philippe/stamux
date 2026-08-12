import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface NotificationItem {
  id: string
  type: string
  message: string
  read_at: string | null
  created_at: string
}

interface NotificationsResponse {
  success: boolean
  data: {
    notifications: NotificationItem[]
    unread_count: number
  }
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await apiClient.get<NotificationsResponse>('/notifications')
  return response.data
}

async function markRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`)
}

async function markAllRead(): Promise<void> {
  await apiClient.post('/notifications/read-all')
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.4)
  } catch {
    // Web Audio non disponible, on ignore silencieusement
  }
}

export function useNotifications() {
  const queryClient = useQueryClient()
  const lastUnreadCount = useRef<number | null>(null)

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 15000,
  })

  useEffect(() => {
    const count = query.data?.data.unread_count
    if (count === undefined) return

    if (lastUnreadCount.current !== null && count > lastUnreadCount.current) {
      playNotificationSound()
    }
    lastUnreadCount.current = count
  }, [query.data?.data.unread_count])

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return {
    notifications: query.data?.data.notifications ?? [],
    unreadCount: query.data?.data.unread_count ?? 0,
    isLoading: query.isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  }
}