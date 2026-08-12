import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface MessageUser {
  id: string
  name: string
  role: string
  avatar_path?: string | null
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  body: string | null
  attachment_url?: string | null
  attachment_type?: string | null
  attachment_name?: string | null
  created_at: string
  sender: MessageUser
}

export interface ConversationSummary {
  id: number
  type: 'direct' | 'group'
  participants: MessageUser[]
  last_message: Message | null
  unread_count: number
  updated_at: string | null
}

async function fetchConversations(): Promise<{ data: ConversationSummary[] }> {
  const res = await apiClient.get('/messaging')
  return res.data
}

async function fetchMessages(conversationId: number): Promise<{ data: Message[] }> {
  const res = await apiClient.get(`/messaging/${conversationId}/messages`)
  return res.data
}

async function sendMessage(payload: {
  conversationId: number
  body?: string
  attachment?: File
  isVoiceNote?: boolean
}): Promise<{ data: Message }> {
  const formData = new FormData()
  if (payload.body) formData.append('body', payload.body)
  if (payload.attachment) {
    formData.append('attachment', payload.attachment)
    formData.append('is_voice_note', payload.isVoiceNote ? '1' : '0')
  }
  const res = await apiClient.post(`/messaging/${payload.conversationId}/messages`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return res.data
}

async function markRead(conversationId: number) {
  const res = await apiClient.post(`/messaging/${conversationId}/read`)
  return res.data
}

async function startConversation(userId: string): Promise<{ data: ConversationSummary }> {
  const res = await apiClient.post('/messaging/start', { user_id: userId })
  return res.data
}

async function fetchUnreadCount(): Promise<{ data: { unread: number } }> {
  const res = await apiClient.get('/messaging/unread-count')
  return res.data
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 20000,
  })
}

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId as number),
    enabled: conversationId !== null,
    refetchInterval: 8000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['messages', variables.conversationId] })
      const previous = queryClient.getQueryData<{ data: Message[] }>(['messages', variables.conversationId])

      const optimisticMessage: Message = {
        id: Date.now(),
        conversation_id: variables.conversationId,
        sender_id: '__optimistic__',
        body: variables.body ?? null,
        created_at: new Date().toISOString(),
        sender: { id: '__optimistic__', name:'', role: '' },
      }

      queryClient.setQueryData(['messages', variables.conversationId], (old: { data: Message[] } | undefined) => ({
        data: [...(old?.data ?? []), optimisticMessage],
      }))

      return { previous }
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['messages',variables.conversationId], context.previous)
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startConversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
  })
}