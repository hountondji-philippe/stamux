import { useState } from 'react'
import { usePendingPermissions, useReviewPermission } from '../hooks/use-permissions'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FileClock } from 'lucide-react'

export function PermissionReviewPage() {
  const { data, isLoading } = usePendingPermissions()
  const { mutate, isPending } = useReviewPermission()
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})

  const pending = data?.data ?? []

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    mutate({ id, status, mentor_comment: commentDrafts[id] || undefined })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Demandes de permission</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Approuve ou rejette les demandes en attente.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {!isLoading && pending.length === 0 && (
        <EmptyState
          icon={FileClock}
          title="Rien a traiter"
          description="Les demandes de permission de tes stagiaires apparaitront ici des qu'ils en soumettent une."
        />
      )}

      <div className="space-y-3">
        {pending.map((p) => (
          <Card key={p.id}>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.intern?.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {p.start_date} → {p.end_date}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.reason}</p>
              </div>

              <input
                type="text"
                placeholder="Commentaire (optionnel)"
                value={commentDrafts[p.id] ?? ''}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(p.id, 'approved')}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-success py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleReview(p.id, 'rejected')}
                  disabled={isPending}
                  className="flex-1 rounded-lg border border-danger py-2 text-sm font-medium text-danger hover:bg-danger-light disabled:opacity-50"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}