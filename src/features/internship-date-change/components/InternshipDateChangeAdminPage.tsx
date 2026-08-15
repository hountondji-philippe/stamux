import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { usePendingDateChanges, useReviewDateChange } from '../hooks/use-internship-date-change'

export function InternshipDateChangeAdminPage() {
  const { data, isLoading } = usePendingDateChanges()
  const { mutate, isPending, error } = useReviewDateChange()
  const [comments, setComments] = useState<Record<string, string>>({})

  const requests = data?.data ?? []

  function handleReview(id: string, status: 'approved' | 'rejected') {
    mutate({ id, status, admin_comment: comments[id] || undefined })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de modification de dates"
        description="Valide ou rejette les demandes de changement de dates de stage."
      />

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucune demande en attente"
          description="Toutes les demandes de modification de dates ont ete traitees."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{r.intern.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{r.intern.email}</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {r.requested_start_date} au {r.requested_end_date}
                </p>
              </div>

              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{r.reason}</p>

              <textarea
                rows={2}
                value={comments[r.id] ?? ''}
                onChange={(e) => setComments({ ...comments, [r.id]: e.target.value })}
                placeholder="Commentaire (optionnel)"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              {error && <p className="mt-2 text-sm text-danger">{getApiErrorMessage(error)}</p>}

              <div className="mt-3 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => handleReview(r.id, 'rejected')}
                >
                  Rejeter
                </Button>
                <Button className="flex-1" disabled={isPending} onClick={() => handleReview(r.id, 'approved')}>
                  Approuver
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}