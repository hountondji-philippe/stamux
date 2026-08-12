import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: string
  trendDirection?: 'up' | 'down'
  icon: LucideIcon
  accent: 'primary' | 'success' | 'warning' | 'danger'
}

const accentStyles = {
  primary: 'bg-primary-light text-primary-dark',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
}

export function StatCard({ label, value, trend, trendDirection, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md dark:bg-slate-900 dark:ring-white/10">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentStyles[accent]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trendDirection === 'down' ? 'text-danger' : 'text-success'
            }`}
          >
            {trendDirection === 'down' ? '↓' : '↑'} {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}