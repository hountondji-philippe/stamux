import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../lib/api/client'

export interface DirectoryUser {
  id: string
  name: string
  role: string
  avatar_path: string | null
}

async function fetchDirectory(): Promise<{ data: DirectoryUser[] }> {
  const res = await apiClient.get('/directory')
  return res.data
}

export function useDirectory() {
  return useQuery({ queryKey: ['directory'], queryFn: fetchDirectory })
}