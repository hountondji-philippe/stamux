import { AxiosError } from 'axios'

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    if (data?.error?.details) {
      const firstDetail = Object.values(data.error.details)[0]?.[0]
      if (firstDetail) return firstDetail
    }

    if (data?.error?.message) {
      return data.error.message
    }
  }

  return 'Une erreur est survenue. Reessaie dans un instant.'
}