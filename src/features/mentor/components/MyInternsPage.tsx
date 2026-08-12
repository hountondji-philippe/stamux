import { Mail, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useInternships } from '../hooks/use-internships'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Users } from 'lucide-react'

const statusLabels: Record<string, string> = {
  active: 'En cours',
  completed: 'Termine',
  terminated: 'Interrompu',
}

const statusTones = {
  active: 'success',
  completed: 'primary',
  terminated: 'danger',
} as const

function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const today = new Date()
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export function MyInternsPage() {
  const { data, isLoading, isError } = useInternships()
  const internships = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes stagiaires"
        description={`${internships.length} stage${internships.length !== 1 ? 's' : ''} suivi${internships.length !== 1 ? 's' : ''}.`}
      />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {isError && <p className="text-sm text-danger">Impossible de charger la liste.</p>}

      {!isLoading && !isError && internships.length === 0 && (
        <EmptyState
          icon={Users}
          title="Aucun stagiaire assigne"
          description="Les stagiaires que l'administrateur t'assigne apparaitront ici."
        />
      )}

      {!isLoading && !isError && internships.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {internships.map((i) => {
            const remaining = daysRemaining(i.end_date)
            return (
              <Link key={i.id} to={`/mes-stagiaires/${i.intern?.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar name={i.intern?.name ?? '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {i.intern?.name}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      <Mail size={12} />
                      {i.intern?.email}
                    </p>
                  </div>
                  <Badge tone={statusTones[i.status]}>{statusLabels[i.status]}</Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {i.start_date} → {i.end_date}
                  </span>
                  {i.status === 'active' && (
                    <span className={remaining < 7 ? 'font-medium text-warning' : ''}>
                      {remaining > 0 ? `${remaining}j restants` : 'Termine'}
                    </span>
                  )}
                </div>
              </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}