import { useMemo, useState } from 'react'
import { useAttendanceDashboard } from '../hooks/use-attendance-dashboard'
import { StatCard } from '../../../components/ui/StatCard'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { Avatar } from '../../../components/ui/Avatar'
import { EmptyState } from '../../../components/ui/EmptyState'

const statusLabels: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'En retard',
  permission: 'Permission',
}

const statusTones = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  permission: 'primary',
} as const

export function AttendanceDashboardPage() {
  const { data, isLoading, isError } = useAttendanceDashboard()
  const [selectedIntern, setSelectedIntern] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const attendances = data?.data.attendances ?? []

  const internOptions = useMemo(() => {
    const seen = new Map<string, string>()
    attendances.forEach((a) => {
      if (a.intern?.id && !seen.has(a.intern.id)) {
        seen.set(a.intern.id, a.intern.name)
      }
    })
    return Array.from(seen.entries())
  }, [attendances])

  const counts = useMemo(
    () => ({
      present: attendances.filter((a) => a.status === 'present').length,
      late: attendances.filter((a) => a.status === 'late').length,
      absent: attendances.filter((a) => a.status === 'absent').length,
    }),
    [attendances]
  )

  const filtered = attendances.filter((a) => {
    const matchesIntern = selectedIntern ? a.intern?.id === selectedIntern : true
    const matchesDate = dateFilter ? a.date === dateFilter : true
    return matchesIntern && matchesDate
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Presences des stagiaires" description="Suis les pointages, filtre par stagiaire ou par date." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Sur site" value={String(counts.present)} icon={CheckCircle2} accent="success" />
        <StatCard label="En retard" value={String(counts.late)} icon={Clock} accent="warning" />
        <StatCard label="Absents" value={String(counts.absent)} icon={XCircle} accent="danger" />
      </div>

      <Card noPadding className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Tous les stagiaires</option>
            {internOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {(selectedIntern || dateFilter) && (
            <button
              onClick={() => {
                setSelectedIntern('')
                setDateFilter('')
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Effacer
            </button>
          )}
        </div>

        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {isError && <p className="text-sm text-danger">Impossible de charger les presences.</p>}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="Aucun resultat"
            description="Rien a afficher pour ces criteres."
          />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <DataTable columns={['Stagiaire', 'Date', 'Arrivee', 'Depart', 'Statut']}>
            {filtered.map((a) => (
              <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.intern?.name ?? '?'} size="sm" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{a.intern?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.date}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.arrival_time ?? '—'}</td>
                <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.departure_time ?? '—'}</td>
                <td className="px-6 py-3">
                  <Badge tone={statusTones[a.status]}>{statusLabels[a.status]}</Badge>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Card>
    </div>
  )
}