import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar, FolderKanban } from 'lucide-react'
import { useInternships } from '../hooks/use-internships'
import { useInternAttendance } from '../hooks/use-intern-attendance'
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

export function InternDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: internshipsData } = useInternships()
  const { data: attendanceData, isLoading: attLoading } = useInternAttendance(id ?? '')
  const { data: reportsData } = useReportHistory()

  const internship = internshipsData?.data.find((i) => i.intern?.id === id)
  const attendances = attendanceData?.data ?? []
  const reports = (reportsData?.data ?? []).filter((r) => r.intern?.id === id)

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
        <EmptyState
          icon={FolderKanban}
          title="Module a venir"
          description="Les projets et taches de ce stagiaire s'afficheront ici une fois le module construit."
        />
      </div>
    </div>
  )
}