import { CheckCircle2, Circle, Clock, FolderKanban, Star } from 'lucide-react'
import { useProjects } from '../hooks/use-projects'
import { useTasks, useUpdateMyTaskStatus } from '../hooks/use-tasks'
import { useAuthStore } from '../../../store/auth-store'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { TaskStatus } from '../../../types/task'

const statusLabels: Record<TaskStatus, string> = { todo: 'A faire', in_progress: 'En cours', done: 'Termine' }

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
}

const statusColors = {
  todo: 'text-slate-400',
  in_progress: 'text-warning',
  done: 'text-success',
}

function ProjectTasks({ projectId }: { projectId: string }) {
  const { data } = useTasks(projectId)
  const { mutate: updateStatus } = useUpdateMyTaskStatus()
  const user = useAuthStore((state) => state.user)
  const tasks = data?.data ?? []

  const myTasks = tasks.filter((t) => t.interns?.some((i) => i.id === user?.id))

  if (myTasks.length === 0) {
    return <p className="text-sm text-slate-400">Aucune tache pour l'instant.</p>
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {myTasks.map((t) => {
        const myEntry = t.interns?.find((i) => i.id === user?.id)
        if (!myEntry) return null
        const Icon = statusIcons[myEntry.status]

        return (
          <div key={t.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2.5">
              <Icon size={16} className={statusColors[myEntry.status]} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.title}</p>
                {t.due_date && <p className="text-xs text-slate-500 dark:text-slate-400">Echeance : {t.due_date}</p>}
              </div>
            </div>
            <select
              value={myEntry.status}
              onChange={(e) => updateStatus({ id: t.id, status: e.target.value as TaskStatus })}
              className="h-9 rounded-lg border border-slate-300 px-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="todo">{statusLabels.todo}</option>
              <option value="in_progress">{statusLabels.in_progress}</option>
              <option value="done">{statusLabels.done}</option>
            </select>
          </div>
        )
      })}
    </div>
  )
}

export function ProjectsInternPage() {
  const { data, isLoading } = useProjects()
  const user = useAuthStore((state) => state.user)
  const projects = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Mes projets" description="Choisis le statut de chaque tache dans le menu." />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}

      {!isLoading && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Les projets que ton mentor te confie apparaitront ici."
        />
      )}

      <div className="space-y-5">
        {projects.map((p) => {
          const myEntry = p.interns?.find((i) => i.id === user?.id)

          return (
            <Card key={p.id} className="border-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{p.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
                </div>
                {myEntry?.evaluation_score !== null && myEntry?.evaluation_score !== undefined && (
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1 text-sm font-semibold text-warning">
                      <Star size={14} fill="currentColor" />
                      {myEntry.evaluation_score}/100
                    </span>
                    <span className="text-[11px] text-slate-400">Ta note</span>
                  </div>
                )}
              </div>

              {myEntry?.evaluation_comment && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  {myEntry.evaluation_comment}
                </p>
              )}

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Progression du projet</span>
                  <span className="font-medium">{p.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Mes taches</p>
                <ProjectTasks projectId={p.id} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}