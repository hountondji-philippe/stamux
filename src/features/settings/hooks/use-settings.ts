import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'
import { useAuthStore } from '../../../store/auth-store'
import type { User } from '../../../types/user'

interface MeResponse {
  success: boolean
  data: User
}

interface PlatformSettings {
  id: number
  platform_name: string
  institution_name: string | null
  tagline: string | null
  default_language: string
  timezone: string
  contact_email: string | null
  logo_path: string | null
  logo_url: string | null
  favicon_path: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  success_color: string
  error_color: string
  background_primary_color: string
  background_secondary_color: string
  font_family: string
  font_scale: number
}

interface PlatformSettingsResponse {
  success: boolean
  data: PlatformSettings
}

interface UpdatePreferencesPayload {
  notify_email?: boolean
  notify_push?: boolean
  notify_attendance_reminder?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  language?: string
  timezone?: string
}

interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

interface UpdatePlatformSettingsPayload {
  platform_name?: string
  institution_name?: string | null
  tagline?: string | null
  default_language?: string
  timezone?: string
  contact_email?: string | null
  primary_color?: string
  secondary_color?: string
  success_color?: string
  error_color?: string
  background_primary_color?: string
  background_secondary_color?: string
  font_family?: string
  font_scale?: number
}

async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/me')
  return response.data
}

async function updateProfile(payload: UpdateProfilePayload): Promise<MeResponse> {
  const response = await apiClient.patch<MeResponse>('/me', payload)
  return response.data
}

async function updatePreferences(payload: UpdatePreferencesPayload): Promise<MeResponse> {
  const response = await apiClient.patch<MeResponse>('/me', payload)
  return response.data
}

async function updatePassword(payload: UpdatePasswordPayload) {
  const response = await apiClient.patch('/me/password', payload)
  return response.data
}

async function uploadAvatar(file: File): Promise<MeResponse> {
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await apiClient.post<MeResponse>('/me/avatar', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

async function fetchPlatformSettings(): Promise<PlatformSettingsResponse> {
  const response = await apiClient.get<PlatformSettingsResponse>('/settings')
  return response.data
}

async function updatePlatformSettings(payload: UpdatePlatformSettingsPayload): Promise<PlatformSettingsResponse> {
  const response = await apiClient.patch<PlatformSettingsResponse>('/admin/settings', payload)
  return response.data
}

async function uploadLogo(file: File): Promise<PlatformSettingsResponse> {
  const formData = new FormData()
  formData.append('logo', file)
  const response = await apiClient.post<PlatformSettingsResponse>('/admin/settings/logo', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

async function uploadFavicon(file: File): Promise<PlatformSettingsResponse> {
  const formData = new FormData()
  formData.append('favicon', file)
  const response = await apiClient.post<PlatformSettingsResponse>('/admin/settings/favicon', formData, {
    headers: { 'Content-Type': undefined },
  })
  return response.data
}

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: fetchMe })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUpdatePassword() {
  return useMutation({ mutationFn: updatePassword })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)
  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (data) => {
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function usePlatformSettings() {
  const isAuthenticated = useAuthStore((state) => !!state.user)
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: fetchPlatformSettings,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-settings'] }),
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-settings'] }),
  })
}

export function useUploadFavicon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadFavicon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-settings'] }),
  })
}