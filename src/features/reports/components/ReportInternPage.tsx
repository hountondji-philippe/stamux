import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, FileCheck } from 'lucide-react'
import { useReportHistory, useSubmitReport, useDownloadReport } from '../hooks/use-reports'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { Card } from '../../../components/ui/Card'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { FileInput } from '../../../components/ui/FileInput'

const submitSchema = z
  .object({
    type: z.enum(['weekly', 'monthly']),
    period_start: z.string().min(1, 'La date de debut est requise'),
    period_end: z.string().min(1, 'La date de fin est requise'),
    file: z.instanceof(FileList).refine((files) => files.length > 0, 'Le fichier est requis'),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message: 'La date de fin doit etre apres ou egale a la date de debut',
    path: ['period_end'],
  })

type SubmitFormData = z.infer<typeof submitSchema>

const typeLabels: Record<string, string> = { weekly: 'Hebdomadaire', monthly: 'Mensuel' }
const statusLabels: Record<string, string> = {
  pending: 'En attente',
  validated: 'Valide',
  rejected: 'Rejete',
}
const statusStyles: Record<string, string> = {
  pending: 'bg-warning-light text-warning',
  validated: 'bg-success-light text-success',
  rejected: 'bg-danger-light text-danger',
}

export function ReportInternPage() {
  const { data, isLoading } = useReportHistory()
  const { mutate: submit, isPending, error } = useSubmitReport()
  const { mutate: download } = useDownloadReport()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubmitFormData>({ resolver: zodResolver(submitSchema) })

  const selectedFile = watch('file')?.[0]
  const history = data?.data ?? []

  const onSubmit = (formData: SubmitFormData) => {
    submit(
      {
        type: formData.type,
        period_start: formData.period_start,
        period_end: formData.period_end,
        file: formData.file[0],
      },
      {
        onSuccess: () => {
          reset()
          setShowForm(false)
        },
      }
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mes rapports</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Soumets tes rapports hebdomadaires ou mensuels.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Soumettre un rapport
          </button>
        )}
      </div>

      {showForm && (
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Nouveau rapport</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300"
            >
              Annuler
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Type de rapport" htmlFor="type">
              <select
                id="type"
                className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                {...register('type')}
              >
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Debut de periode" htmlFor="period_start" error={errors.period_start?.message}>
                <TextInput id="period_start" type="date" {...register('period_start')} />
              </FormField>
              <FormField label="Fin de periode" htmlFor="period_end" error={errors.period_end?.message}>
                <TextInput id="period_end" type="date" {...register('period_end')} />
              </FormField>
            </div>

            <FormField label="Fichier (PDF, JPG ou PNG, 10 Mo max)" htmlFor="file" error={errors.file?.message as string}>
              <FileInput id="file" accept=".pdf,.jpg,.jpeg,.png" {...register('file')} />
              {selectedFile && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <FileCheck size={14} className="text-success" />
                  {selectedFile.name}
                </p>
              )}
            </FormField>

            {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? 'Envoi...' : 'Soumettre'}
            </button>
          </form>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Historique</h2>
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun rapport soumis pour l'instant.</p>
        )}
        <div className="space-y-3">
          {history.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {typeLabels[r.type]} · {r.period_start} → {r.period_end}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{r.file_name}</p>
                  {r.mentor_comment && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Commentaire du mentor : {r.mentor_comment}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[r.status]}`}
                  >
                    {statusLabels[r.status]}
                  </span>
                  <button
                    onClick={() => download(r.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Telecharger"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}