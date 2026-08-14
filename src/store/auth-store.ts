import { create } from 'zustand'
import type { User } from '../types/user'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  updateUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  updateUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, token: null }),
}))

// Store the auth session in memory only to avoid token theft via localStorage/XSS.
// A full SPA session should instead use secure HttpOnly cookies when possible.