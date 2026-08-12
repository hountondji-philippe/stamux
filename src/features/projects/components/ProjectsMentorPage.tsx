import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderKanban, Users } from 'lucide-react'
import { useProjects } from '../hooks/use-projects'
import { CreateProjectForm } from './CreateProjectForm'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'

const statusLabels: Record<string, string> = { active: 'En cours', completed: 'Termine', archived: 'Archive' }
const statusTones = { active: 'success', completed: 'primary', archived: 'neutral' } as const

export function ProjectsMentorPage() {
  const { data, isLoading } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const projects = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description={`${projects.length} projet${projects.length !== 1 ? 's' : ''} cree${projects.length !== 1 ? 's' : ''}.`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Nouveau projet
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}

      {!isLoading && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Cree ton premier projet et assigne des stagiaires."
        />
      )}

      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{p.title}</p>
                  <Badge tone={statusTones[p.status]}>{statusLabels[p.status]}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{p.description}</p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Progression</span>
                    <span className="font-medium">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users size={13} />
                  {p.interns?.length ?? 0} stagiaire{(p.interns?.length ?? 0) !== 1 ? 's' : ''}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau projet">
        <CreateProjectForm onSuccess={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}