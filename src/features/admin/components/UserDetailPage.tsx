import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Star, FolderKanban } from 'lucide-react'
import { useAdminUser, useAdminUserOverview, useRateUser, useCompleteInternship } from '../hooks/use-admin-user-detail'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { roleLabels } from '../../../lib/utils/role-labels'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import type { AdminMentorOverview, AdminInternOverview } from '../../../types/admin-overview'

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

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="outline-none">
          <Star
            size={22}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
          />
        </button>
      ))}
    </div>
  )
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: userData, isLoading: userLoading } = useAdminUser(id ?? '')
  const { data: overviewData, isLoading: overviewLoading } = useAdminUserOverview(id ?? '')
  const { mutate: rate, isPending: isRating, error: rateError } = useRateUser(id ?? '')
  const { mutate: completeInternship, isPending: isCompleting, isSuccess: completeSuccess } = useCompleteInternship(id ?? '')
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const user = userData?.data
  const overview = overviewData?.data

  const [ratingValue, setRatingValue] = useState(0)
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setRatingValue(user.admin_rating ?? 0)
      setComment(user.admin_rating_comment ?? '')
    }
  }, [user])

  if (userLoading || !user) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
  }

  const handleRate = () => {
    if (ratingValue < 1) return
    rate(
      { admin_rating: ratingValue, admin_rating_comment: comment || null },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  const mentorOverview = overview?.role === 'mentor' ? (overview as AdminMentorOverview) : null
  const internOverview = overview?.role === 'intern' ? (overview as AdminInternOverview) : null

  return (
    <div className="space-y-6">
      <Link
        to="/admin/utilisateurs"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft size={14} />
        Utilisateurs
      </Link>

      <PageHeader title={user.name} description={user.email} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <Mail size={14} />
                  {user.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone="success">{roleLabels[user.role]}</Badge>
                  <Badge tone={user.status === 'active' ? 'success' : 'neutral'}>
                    {user.status === 'active' ? 'Actif' : user.status}
                  </Badge>
                </div>
                {user.role === 'intern' && (
                  <div className="mt-3">
                    {completeSuccess ? (
                      <p className="text-sm text-success">Stage marque comme termine.</p>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
                        disabled={isCompleting}
                        onClick={() => setShowCompleteConfirm(true)}
                      >
                        {isCompleting ? 'Traitement...' : 'Marquer le stage comme termine'}
                      </Button>
                    )}
                    <ConfirmDialog
                      open={showCompleteConfirm}
                      title="Terminer le stage"
                      message="Marquer ce stage comme termine ? Cela permettra au stagiaire de soumettre son evaluation de fin de stage."
                      confirmLabel="Marquer comme termine"
                      onConfirm={() => {
                        completeInternship()
                        setShowCompleteConfirm(false)
                      }}
                      onCancel={() => setShowCompleteConfirm(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {overviewLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}

          {mentorOverview && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Stagiaires encadres
              </h2>
              {mentorOverview.interns.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="Aucun stagiaire"
                  description="Ce mentor n'encadre aucun stagiaire actif pour l'instant."
                />
              ) : (
                <DataTable columns={['Stagiaire', 'Presence', 'Note moyenne']}>
                  {mentorOverview.interns.map((item) => (
                    <tr key={item.internship_id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={item.intern.name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{item.intern.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.intern.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                        {item.presence_percent !== null ? `${item.presence_percent}%` : '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                        {item.average_note !== null ? `${item.average_note}/100` : '—'}
                      </td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </div>
          )}

          {internOverview && (
            <>
              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Presences</h2>
                {internOverview.attendances.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucune presence enregistree.</p>
                ) : (
                  <DataTable columns={['Date', 'Arrivee', 'Depart', 'Statut']}>
                    {internOverview.attendances.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{a.date}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.arrival_time ?? '—'}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.departure_time ?? '—'}</td>
                        <td className="px-6 py-3">
                          <Badge tone={attendanceStatusTones[a.status as keyof typeof attendanceStatusTones]}>
                            {attendanceStatusLabels[a.status] ?? a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Rapports</h2>
                {internOverview.reports.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun rapport soumis.</p>
                ) : (
                  <DataTable columns={['Type', 'Periode', 'Statut']}>
                    {internOverview.reports.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{reportTypeLabels[r.type] ?? r.type}</td>
                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                          {r.period_start} → {r.period_end}
                        </td>
                        <td className="px-6 py-3">
                          <Badge tone={reportStatusTones[r.status as keyof typeof reportStatusTones]}>
                            {reportStatusLabels[r.status] ?? r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </DataTable>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Projets</h2>
                {internOverview.projects.length === 0 ? (
                  <EmptyState icon={FolderKanban} title="Aucun projet" description="Aucun projet assigne." />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {internOverview.projects.map((p) => (
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
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <p className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Evaluation administrateur</p>
            <StarRating value={ratingValue} onChange={setRatingValue} />
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Commentaire (optionnel)"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {rateError && <p className="mt-2 text-sm text-danger">{getApiErrorMessage(rateError)}</p>}
            {saved && <p className="mt-2 text-sm text-success">Evaluation enregistree.</p>}
            <Button className="mt-3 w-full" disabled={isRating || ratingValue < 1} onClick={handleRate}>
              {isRating ? 'Enregistrement...' : 'Enregistrer la note'}
            </Button>
          </Card>

          {mentorOverview && mentorOverview.mentorship_rating_avg !== null && (
            <Card>
              <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Satisfaction stagiaires</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Note moyenne donnee par les stagiaires encadres
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mentorOverview.mentorship_rating_avg}/5
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}