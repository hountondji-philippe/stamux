import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Star, CheckCircle2 } from 'lucide-react'
import { useProject, useAssignInterns, useEvaluateIntern, useUpdateProgress } from '../hooks/use-projects'
import { useTasks, useCreateTask } from '../hooks/use-tasks'
import { useUsers } from '../../admin/hooks/use-users'
import { useInternships } from '../../mentor/hooks/use-internships'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { getApiErrorMessage } from '../../../lib/utils/api-error'

const taskStatusLabels: Record<string, string> = { todo: 'A faire', in_progress: 'En cours', done: 'Termine' }
const taskStatusTones = { todo: 'neutral', in_progress: 'warning', done: 'success' } as const

function AssignInternsModal({ projectId, currentIds, onClose }: { projectId: string; currentIds: string[]; onClose: () => void }) {
  const { data: internshipsData } = useInternships()
  const { mutate, isPending, error } = useAssignInterns()
  const [selected, setSelected] = useState<string[]>(currentIds)

  const myInterns = (internshipsData?.data ?? []).filter((i) => i.status === 'active')

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return [...prev, id]
    })
  }

  return (
    <Modal open onClose={onClose} title="Assigner des stagiaires">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">{selected.length} stagiaire{selected.length !== 1 ? 's' : ''} selectionne{selected.length !== 1 ? 's' : ''}.</p>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {myInterns.map((i) => {
            const id = i.intern?.id ?? ''
            const checked = selected.includes(id)
            const disabled = false
            return (
              <label
                key={id}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                  disabled ? 'opacity-40' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
                } border-slate-200 dark:border-slate-700`}
              >
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(id)} />
                <Avatar name={i.intern?.name ?? '?'} size="sm" />
                <span className="text-slate-900 dark:text-slate-100">{i.intern?.name}</span>
              </label>
            )
          })}
        </div>

        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

        <Button
          fullWidth
          disabled={isPending || selected.length === 0}
          onClick={() => mutate({ id: projectId, intern_ids: selected }, { onSuccess: onClose })}
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </Modal>
  )
}

function CreateTaskModal({ projectId, interns, onClose }: { projectId: string; interns: { id: string; name: string }[]; onClose: () => void }) {
  const { mutate, isPending, error } = useCreateTask()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <Modal open onClose={onClose} title="Nouvelle tache">
      <div className="space-y-4">
        <FormField label="Titre" htmlFor="task-title">
          <TextInput id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Description (optionnel)" htmlFor="task-desc">
          <textarea
            id="task-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </FormField>
        <FormField label="Echeance (optionnel)" htmlFor="task-due">
          <TextInput id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </FormField>

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Assigner a</p>
          <div className="space-y-1.5">
            {interns.map((i) => (
              <label key={i.id} className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100">
                <input type="checkbox" checked={selected.includes(i.id)} onChange={() => toggle(i.id)} />
                {i.name}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

        <Button
          fullWidth
          disabled={isPending || !title || selected.length === 0}
          onClick={() =>
            mutate(
              { projectId, title, description: description || undefined, due_date: dueDate || undefined, intern_ids: selected },
              { onSuccess: onClose }
            )
          }
        >
          {isPending ? 'Creation...' : 'Creer la tache'}
        </Button>
      </div>
    </Modal>
  )
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projectData } = useProject(id ?? '')
  const { data: tasksData } = useTasks(id ?? '')
  const { mutate: evaluate } = useEvaluateIntern()
  const { mutate: updateProgress, isPending: isCompleting } = useUpdateProgress()
  const [assignOpen, setAssignOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [evaluating, setEvaluating] = useState<string | null>(null)
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')

  const project = projectData?.data
  const tasks = tasksData?.data ?? []

  if (!project) return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>

  const isCompleted = project.status === 'completed'

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        <ArrowLeft size={14} />
        Projets
      </Link>

      <PageHeader
        title={project.title}
        description={project.description}
        action={
          <Button
            variant={isCompleted ? 'secondary' : 'primary'}
            icon={<CheckCircle2 size={16} />}
            disabled={isCompleted || isCompleting}
            onClick={() => updateProgress({ id: project.id, progress: 100 })}
          >
            {isCompleted ? 'Projet termine' : isCompleting ? 'Enregistrement...' : 'Marquer comme termine'}
          </Button>
        }
      />

      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Stagiaires assignes ({project.interns?.length ?? 0})
          </p>
          <Button variant="secondary" onClick={() => setAssignOpen(true)}>
            Gerer
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {(project.interns ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Avatar name={i.name} size="sm" />
                <span className="text-sm text-slate-900 dark:text-slate-100">{i.name}</span>
              </div>
              {i.evaluation_score !== null ? (
                <span className="flex items-center gap-1 text-sm font-medium text-warning">
                  <Star size={14} fill="currentColor" />
                  {i.evaluation_score}/100
                </span>
              ) : (
                <button
                  onClick={() => setEvaluating(i.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Evaluer
                </button>
              )}
            </div>
          ))}
          {(!project.interns || project.interns.length === 0) && (
            <p className="text-sm text-slate-400">Aucun stagiaire assigne pour l'instant.</p>
          )}
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Taches</h2>
          <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setTaskModalOpen(true)}>
            Nouvelle tache
          </Button>
        </div>
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id}>
              <p className="font-medium text-slate-900 dark:text-slate-100">{t.title}</p>
              {t.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {(t.interns ?? []).map((ti) => (
                  <Badge key={ti.id} tone={taskStatusTones[ti.status]}>
                    {ti.name} · {taskStatusLabels[ti.status]}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
          {tasks.length === 0 && <p className="text-sm text-slate-400">Aucune tache pour l'instant.</p>}
        </div>
      </div>

      {assignOpen && (
        <AssignInternsModal
          projectId={project.id}
          currentIds={(project.interns ?? []).map((i) => i.id)}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {taskModalOpen && (
        <CreateTaskModal projectId={project.id} interns={project.interns ?? []} onClose={() => setTaskModalOpen(false)} />
      )}

      {evaluating && (
        <Modal open onClose={() => setEvaluating(null)} title="Evaluer le stagiaire">
          <div className="space-y-4">
            <FormField label="Note sur 100" htmlFor="score">
              <TextInput id="score" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
            </FormField>
            <FormField label="Commentaire (optionnel)" htmlFor="eval-comment">
              <textarea
                id="eval-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </FormField>
            <Button
              fullWidth
              disabled={!score}
              onClick={() =>
                evaluate(
                  { projectId: project.id, internId: evaluating, score: Number(score), comment: comment || undefined },
                  { onSuccess: () => setEvaluating(null) }
                )
              }
            >
              Enregistrer l'evaluation
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}