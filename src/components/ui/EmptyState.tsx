import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
        <Icon size={24} strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}