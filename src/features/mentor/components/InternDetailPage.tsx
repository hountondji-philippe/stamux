import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar, FolderKanban, CheckSquare } from 'lucide-react'
import { useInternships } from '../hooks/use-internships'
import { useInternAttendance } from '../hooks/use-intern-attendance'
import { useInternProjectsOverview } from '../hooks/use-intern-projects-overview'
import { useReportHistory } from '../../reports/hooks/use-reports'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'

const attendanceStatusLabels: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'En retard',
  permission: 'Permission',
}
const attendanceStatusTones = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  permission: 'primary',
} as const

const reportTypeLabels: Record<string, string> = { weekly: 'Hebdomadaire', monthly: 'Mensuel' }
const reportStatusLabels: Record<string, string> = {
  pending: 'En attente',
  validated: 'Valide',
  rejected: 'Rejete',
}
const reportStatusTones = {
  pending: 'warning',
  validated: 'success',
  rejected: 'danger',
} as const

const taskStatusLabels: Record<string, string> = { todo: 'A faire', in_progress: 'En cours', done: 'Termine' }
const taskStatusTones = { todo: 'neutral', in_progress: 'warning', done: 'success' } as const

export function InternDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: internshipsData } = useInternships()
  const { data: attendanceData, isLoading: attLoading } = useInternAttendance(id ?? '')
  const { data: reportsData } = useReportHistory()

  const internship = internshipsData?.data.find((i) => i.intern?.id === id)
  const { data: overviewData, isLoading: overviewLoading } = useInternProjectsOverview(internship?.id ?? '')

  const attendances = attendanceData?.data ?? []
  const reports = (reportsData?.data ?? []).filter((r) => r.intern?.id === id)
  const projects = overviewData?.data.projects ?? []
  const tasks = overviewData?.data.tasks ?? []

  if (!internship) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/mes-stagiaires"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft size={14} />
        Mes stagiaires
      </Link>

      <PageHeader title={internship.intern?.name ?? ''} description={internship.intern?.email} />

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={internship.intern?.name ?? '?'} />
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Mail size={14} />
              {internship.intern?.email}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Calendar size={14} />
              {internship.start_date} → {internship.end_date}
            </p>
          </div>
          <Badge tone={internship.status === 'active' ? 'success' : 'neutral'}>
            {internship.status === 'active' ? 'En cours' : internship.status}
          </Badge>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Presences</h2>
        {attLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!attLoading && attendances.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune presence enregistree.</p>
        )}
        {!attLoading && attendances.length > 0 && (
          <DataTable columns={['Date', 'Arrivee', 'Depart', 'Statut']}>
            {attendances.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{a.date}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.arrival_time ?? '—'}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.departure_time ?? '—'}</td>
                <td className="px-6 py-3">
                  <Badge tone={attendanceStatusTones[a.status]}>{attendanceStatusLabels[a.status]}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Rapports</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun rapport soumis.</p>
        ) : (
          <DataTable columns={['Type', 'Periode', 'Statut']}>
            {reports.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{reportTypeLabels[r.type]}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                  {r.period_start} → {r.period_end}
                </td>
                <td className="px-6 py-3">
                  <Badge tone={reportStatusTones[r.status]}>{reportStatusLabels[r.status]}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Projets</h2>
        {overviewLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!overviewLoading && projects.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet"
            description="Ce stagiaire n'est assigne a aucun projet pour l'instant."
          />
        )}
        {!overviewLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Card key={p.id}>
                <p className="font-medium text-slate-900 dark:text-slate-100">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Progression</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                {p.evaluation_score !== null && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Evaluation: <span className="font-medium text-slate-700 dark:text-slate-300">{p.evaluation_score}/100</span>
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Taches</h2>
        {overviewLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!overviewLoading && tasks.length === 0 && (
          <EmptyState
            icon={CheckSquare}
            title="Aucune tache"
            description="Ce stagiaire n'a pas de tache assignee pour l'instant."
          />
        )}
        {!overviewLoading && tasks.length > 0 && (
          <DataTable columns={['Tache', 'Echeance', 'Statut']}>
            {tasks.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{t.title}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{t.due_date ?? '—'}</td>
                <td className="px-6 py-3">
                  <Badge tone={taskStatusTones[t.status as keyof typeof taskStatusTones]}>
                    {taskStatusLabels[t.status] ?? t.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  )
}