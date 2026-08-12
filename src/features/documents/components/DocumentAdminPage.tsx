import { useState } from 'react'
import { usePendingAdminDocuments, useUploadFinalDocument, useAdminRejectDocument } from '../hooks/use-documents'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FileInput } from '../../../components/ui/FileInput'
import { Avatar } from '../../../components/ui/Avatar'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FileStack, FileCheck } from 'lucide-react'
import type { DocumentType } from '../../../types/document'

const typeLabels: Record<DocumentType, string> = { attestation: 'Attestation', convention: 'Convention de stage' }

export function DocumentAdminPage() {
  const { data, isLoading } = usePendingAdminDocuments()
  const { mutate: upload, isPending: isUploading, error: uploadError } = useUploadFinalDocument()
  const { mutate: reject, isPending: isRejecting, error: rejectError } = useAdminRejectDocument()
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})

  const documents = data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Ces demandes ont deja ete approuvees par le mentor. Televerse le document final."
      />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {!isLoading && documents.length === 0 && (
        <EmptyState icon={FileStack} title="Rien a traiter" description="Aucune demande approuvee par un mentor pour l'instant." />
      )}
      {uploadError && <p className="text-sm text-danger">{getApiErrorMessage(uploadError)}</p>}
      {rejectError && <p className="text-sm text-danger">{getApiErrorMessage(rejectError)}</p>}

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

              <FileInput
                id={`file-${d.id}`}
                accept=".pdf"
                onChange={(e) => setFiles((prev) => ({ ...prev, [d.id]: e.target.files?.[0] ?? null }))}
              />
              {files[d.id] && (
                <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <FileCheck size={14} className="text-success" />
                  {files[d.id]?.name}
                </p>
              )}

              <input
                type="text"
                placeholder="Motif de rejet (si tu rejettes)"
                value={reasons[d.id] ?? ''}
                onChange={(e) => setReasons((prev) => ({ ...prev, [d.id]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              <div className="flex gap-2">
                <Button
                  fullWidth
                  disabled={isUploading || !files[d.id]}
                  onClick={() => {
                    const file = files[d.id]
                    if (file) upload({ id: d.id, file })
                  }}
                >
                  {isUploading ? 'Televersement...' : 'Televerser et finaliser'}
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  disabled={isRejecting || !reasons[d.id]}
                  onClick={() => reject({ id: d.id, rejection_reason: reasons[d.id] })}
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