import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10 ${
        noPadding ? '' : 'p-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}