import { useState } from 'react'
import { usePendingMentorDocuments, useMentorValidateDocument } from '../hooks/use-documents'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Avatar } from '../../../components/ui/Avatar'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FileStack } from 'lucide-react'
import type { DocumentType } from '../../../types/document'

const typeLabels: Record<DocumentType, string> = { attestation: 'Attestation', convention: 'Convention de stage' }

export function DocumentMentorPage() {
  const { data, isLoading } = usePendingMentorDocuments()
  const { mutate, isPending, error } = useMentorValidateDocument()
  const [reasons, setReasons] = useState<Record<string, string>>({})

  const documents = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Documents a valider" description="Approuve ou rejette avant transmission a l'administrateur." />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {!isLoading && documents.length === 0 && (
        <EmptyState icon={FileStack} title="Rien a valider" description="Les demandes de tes stagiaires apparaitront ici." />
      )}
      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

      <div className="space-y-3">
        {documents.map((d) => (
          <Card key={d.id}>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={d.intern?.name ?? '?'} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{d.intern?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{typeLabels[d.type]}</p>
                </div>
              </div>
              {d.request_note && <p className="text-sm text-slate-600 dark:text-slate-400">{d.request_note}</p>}

              <input
                type="text"
                placeholder="Motif (obligatoire en cas de rejet)"
                value={reasons[d.id] ?? ''}
                onChange={(e) => setReasons((prev) => ({ ...prev, [d.id]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              <div className="flex gap-2">
                <Button
                  fullWidth
                  disabled={isPending}
                  onClick={() => mutate({ id: d.id, status: 'approved' })}
                >
                  Approuver
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  disabled={isPending || !reasons[d.id]}
                  onClick={() => mutate({ id: d.id, status: 'rejected', rejection_reason: reasons[d.id] })}
                >
                  Rejeter
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}