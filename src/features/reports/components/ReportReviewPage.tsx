import { useMemo, useState } from 'react'
import { Download, Trash2, Eye } from 'lucide-react'
import { useReviewReport, useDownloadReport, useReportHistory, useDeleteReport } from '../hooks/use-reports'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { Modal } from '../../../components/ui/Modal'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable } from '../../../components/ui/DataTable'
import { Avatar } from '../../../components/ui/Avatar'
import { Card } from '../../../components/ui/Card'
import { StatCard } from '../../../components/ui/StatCard'
import { FileText, CheckCircle2, XCircle } from 'lucide-react'
import type { Report } from '../../../types/report'

const typeLabels: Record<string, string> = { weekly: 'Hebdomadaire', monthly: 'Mensuel' }
const statusLabels: Record<string, string> = {
  pending: 'A valider',
  validated: 'Valide',
  rejected: 'Rejete',
}
const statusTones = {
  pending: 'warning',
  validated: 'success',
  rejected: 'danger',
} as const

const filters = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'A valider' },
  { key: 'validated', label: 'Valides' },
  { key: 'rejected', label: 'Rejetes' },
] as const

function ReportDetailModal({ report, onClose }: { report: Report | null; onClose: () => void }) {
  const { mutate: download } = useDownloadReport()
  const { mutate: review, isPending, error } = useReviewReport()
  const [comment, setComment] = useState('')

  if (!report) return null
  const canReview = report.status === 'pending'

  return (
    <Modal open={!!report} onClose={onClose} title="Detail du rapport">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={report.intern?.name ?? '?'} />
          <div>
            <p className="text-sm font-semibold text-slate-900">{report.intern?.name}</p>
            <p className="text-xs text-slate-500">
              {typeLabels[report.type]} · {report.period_start} → {report.period_end}
            </p>
          </div>
        </div>

        <Badge tone={statusTones[report.status]}>{statusLabels[report.status]}</Badge>

        <Button variant="secondary" fullWidth icon={<Download size={16} />} onClick={() => download(report.id)}>
          Telecharger {report.file_name}
        </Button>

        {report.mentor_comment && (
          <div className="rounded-xl bg-slate-50 p-3.5 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Commentaire
            </p>
            {report.mentor_comment}
          </div>
        )}

        {canReview && (
          <>
            <FormField label="Commentaire (obligatoire en cas de rejet)" htmlFor="review-comment">
              <TextInput
                id="review-comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormField>

            {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                disabled={isPending}
                onClick={() =>
                  review(
                    { id: report.id, status: 'validated', mentor_comment: comment || undefined },
                    { onSuccess: onClose }
                  )
                }
              >
                Valider
              </Button>
              <Button
                variant="danger"
                fullWidth
                disabled={isPending || !comment}
                onClick={() =>
                  review({ id: report.id, status: 'rejected', mentor_comment: comment }, { onSuccess: onClose })
                }
              >
                Rejeter
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export function ReportReviewPage() {
  const { data, isLoading } = useReportHistory()
  const { mutate: review } = useReviewReport()
  const { mutate: download } = useDownloadReport()
  const { mutate: remove } = useDeleteReport()
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]['key']>('all')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const all = data?.data ?? []

  const counts = useMemo(
    () => ({
      pending: all.filter((r) => r.status === 'pending').length,
      validated: all.filter((r) => r.status === 'validated').length,
      rejected: all.filter((r) => r.status === 'rejected').length,
    }),
    [all]
  )

  const visible = activeFilter === 'all' ? all : all.filter((r) => r.status === activeFilter)

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      remove(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports"
        description={`${counts.pending} rapport${counts.pending !== 1 ? 's' : ''} en attente de validation.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="A valider" value={String(counts.pending)} icon={FileText} accent="warning" />
        <StatCard label="Valides" value={String(counts.validated)} icon={CheckCircle2} accent="success" />
        <StatCard label="Rejetes" value={String(counts.rejected)} icon={XCircle} accent="danger" />
      </div>

      <Card noPadding className="p-5">
        <div className="mb-4 flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
                activeFilter === f.key
                  ? 'border-transparent bg-primary-light text-primary-dark'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-slate-500">Chargement...</p>}
        {!isLoading && visible.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Aucun rapport"
            description="Rien a afficher pour ce filtre."
          />
        )}
        {!isLoading && visible.length > 0 && (
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/5">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Stagiaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Depose
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Statut
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.intern?.name ?? '?'} size="sm" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">{r.intern?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{typeLabels[r.type]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{r.period_end}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTones[r.status]}>{statusLabels[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => download(r.id)}
                          className="rounded-lg p-2 text-slate-400 dark:text-slate-500 outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                          aria-label="Telecharger"
                        >
                          <Download size={15} />
                        </button>
                        {r.status === 'pending' ? (
                          <Button variant="primary" onClick={() => setSelectedReport(r)} className="!px-3 !py-1.5 text-xs">
                            Valider
                          </Button>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedReport(r)}
                              className="rounded-lg p-2 text-slate-400 dark:text-slate-500 outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                              aria-label="Consulter"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className={`rounded-lg p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-danger/40 ${
                                confirmDeleteId === r.id
                                  ? 'px-2.5 text-xs font-semibold text-danger'
                                  : 'text-slate-400 hover:bg-danger-light hover:text-danger'
                              }`}
                              aria-label="Supprimer"
                            >
                              {confirmDeleteId === r.id ? 'Confirmer ?' : <Trash2 size={15} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  )
}