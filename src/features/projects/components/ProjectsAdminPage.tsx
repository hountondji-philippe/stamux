import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FolderKanban } from 'lucide-react'
import { useProjects } from '../hooks/use-projects'
import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'

const statusLabels: Record<string, string> = { active: 'En cours', completed: 'Termine', archived: 'Archive' }
const statusTones = { active: 'success', completed: 'primary', archived: 'neutral' } as const

function durationDays(start: string, end: string | null): string {
  if (!end) return '—'
  const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
  return `${days}j`
}

export function ProjectsAdminPage() {
  const { data, isLoading } = useProjects()
  const projects = useMemo(() => data?.data ?? [], [data])

  return (
    <div className="space-y-6">
      <PageHeader title="Projets" description="Vue d'ensemble de tous les projets. La creation se fait cote mentor." />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}

      {!isLoading && projects.length === 0 && (
        <EmptyState icon={FolderKanban} title="Aucun projet" description="Aucun projet n'a encore ete cree." />
      )}

      {!isLoading && projects.length > 0 && (
        <DataTable columns={['Projet', 'Mentor', 'Stagiaires', 'Progression', 'Duree', 'Statut']}>
          {projects.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4">
                <Link to={`/projects/${p.id}`} className="font-medium text-slate-900 hover:text-primary dark:text-slate-100">
                  {p.title}
                </Link>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.mentor?.name}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.interns?.length ?? 0}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.progress}%</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{durationDays(p.start_date, p.end_date)}</td>
              <td className="px-6 py-4">
                <Badge tone={statusTones[p.status]}>{statusLabels[p.status]}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  )
}