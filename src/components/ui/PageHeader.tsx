import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}