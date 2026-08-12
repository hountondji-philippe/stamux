import { useState } from 'react'
import { Download, Eye, FileStack, Pencil, Trash2 } from 'lucide-react'
import { useDocumentHistory, useRequestDocument, useDownloadDocument, useDownloadFile, useEditDocument, useDeleteDocument } from '../hooks/use-documents'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { DocumentType, StamuxDocument } from '../../../types/document'

const typeLabels: Record<DocumentType, string> = { attestation: 'Attestation', convention: 'Convention de stage' }
const statusLabels: Record<string, string> = {
  pending: 'En attente',
  mentor_approved: 'Approuve par le mentor',
  mentor_rejected: 'Rejete par le mentor',
  admin_rejected: 'Rejete',
  completed: 'Disponible',
}
const statusTones = {
  pending: 'warning',
  mentor_approved: 'primary',
  mentor_rejected: 'danger',
  admin_rejected: 'danger',
  completed: 'success',
} as const

const rejectedStatuses = ['mentor_rejected', 'admin_rejected']

function EditDocumentModal({ document: doc, onClose }: { document: StamuxDocument | null; onClose: () => void }) {
  const { mutate, isPending, error } = useEditDocument()
  const [note, setNote] = useState(doc?.request_note ?? '')

  if (!doc) return null

  return (
    <Modal open={!!doc} onClose={onClose} title="Modifier la demande">
      <div className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{typeLabels[doc.type]}</p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Precision (optionnel)
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
        <Button
          fullWidth
          disabled={isPending}
          onClick={() => mutate({ id: doc.id, request_note: note || undefined }, { onSuccess: onClose })}
        >
          {isPending ? 'Envoi...' : 'Renvoyer la demande'}
        </Button>
      </div>
    </Modal>
  )
}

export function DocumentInternPage() {
  const { data, isLoading } = useDocumentHistory()
  const { mutate, isPending, error } = useRequestDocument()
  const { mutate: consult } = useDownloadDocument()
  const { mutate: download, isPending: isDownloading } = useDownloadFile()
  const { mutate: remove } = useDeleteDocument()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<StamuxDocument | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [type, setType] = useState<DocumentType>('attestation')
  const [note, setNote] = useState('')

  const documents = data?.data ?? []

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
        title="Mes documents"
        description="Demande une attestation ou une convention de stage."
        action={<Button onClick={() => setModalOpen(true)}>Nouvelle demande</Button>}
      />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {!isLoading && documents.length === 0 && (
        <EmptyState icon={FileStack} title="Aucune demande" description="Tes demandes de documents apparaitront ici." />
      )}

      <div className="space-y-3">
        {documents.map((d) => (
          <Card key={d.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{typeLabels[d.type]}</p>
                {d.request_note && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d.request_note}</p>}
                {d.rejection_reason && (
                  <p className="mt-1 text-sm text-danger">Motif du rejet : {d.rejection_reason}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge tone={statusTones[d.status]}>{statusLabels[d.status]}</Badge>
                {d.is_downloadable && (
                  <>
                    <button
                      onClick={() => consult(d.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      aria-label="Consulter"
                      title="Consulter"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => download(d.id)}
                      disabled={isDownloading}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      aria-label="Telecharger"
                      title="Telecharger"
                    >
                      <Download size={16} />
                    </button>
                  </>
                )}
                {rejectedStatuses.includes(d.status) && (
                  <>
                    <button
                      onClick={() => setEditing(d)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                      aria-label="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className={
                        confirmDeleteId === d.id
                          ? 'rounded-lg px-2 text-xs font-semibold text-danger'
                          : 'rounded-lg p-2 text-slate-400 hover:bg-danger-light hover:text-danger'
                      }
                      aria-label="Supprimer"
                    >
                      {confirmDeleteId === d.id ? 'Confirmer ?' : <Trash2 size={16} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle demande de document">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Type de document</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="attestation">Attestation</option>
              <option value="convention">Convention de stage</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Precision (optionnel)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
          <Button
            fullWidth
            disabled={isPending}
            onClick={() => mutate({ type, request_note: note || undefined }, { onSuccess: () => setModalOpen(false) })}
          >
            {isPending ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </div>
      </Modal>

      <EditDocumentModal document={editing} onClose={() => setEditing(null)} />
    </div>
  )
}