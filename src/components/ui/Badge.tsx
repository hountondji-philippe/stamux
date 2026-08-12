import type { ReactNode } from 'react'

type BadgeTone = 'success' | 'warning' | 'danger' | 'primary' | 'neutral'

const toneStyles: Record<BadgeTone, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  primary: 'bg-primary-light text-primary-dark',
  neutral: 'bg-slate-100 text-slate-600',
}

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[tone]}`}
    >
      {children}
    </span>
  )
}