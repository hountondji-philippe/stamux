import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePermissionHistory, useRequestPermission } from '../hooks/use-permissions'
import { Card } from '../../../components/ui/Card'
import { getApiErrorMessage } from '../../../lib/utils/api-error'

const requestSchema = z
  .object({
    start_date: z.string().min(1, 'La date de debut est requise'),
    end_date: z.string().min(1, 'La date de fin est requise'),
    reason: z.string().min(1, 'Le motif est requis').max(1000),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'La date de fin doit etre apres ou egale a la date de debut',
    path: ['end_date'],
  })

type RequestFormData = z.infer<typeof requestSchema>

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvee',
  rejected: 'Rejetee',
}

const statusStyles: Record<string, string> = {
  pending: 'bg-warning-light text-warning',
  approved: 'bg-success-light text-success',
  rejected: 'bg-danger-light text-danger',
}

export function PermissionInternPage() {
  const { data, isLoading } = usePermissionHistory()
  const { mutate, isPending, error } = useRequestPermission()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({ resolver: zodResolver(requestSchema) })

  const history = data?.data ?? []

  const onSubmit = (formData: RequestFormData) => {
    mutate(formData, {
      onSuccess: () => {
        reset()
        setShowForm(false)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mes permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Demande une absence justifiee sur une plage de dates.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {showForm ? 'Annuler' : 'Nouvelle demande'}
        </button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date de debut
                </label>
                <input
                  id="start_date"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
                  {...register('start_date')}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-danger">{errors.start_date.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Date de fin
                </label>
                <input
                  id="end_date"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
                  {...register('end_date')}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-danger">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Motif
              </label>
              <textarea
                id="reason"
                rows={3}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
                {...register('reason')}
              />
              {errors.reason && <p className="mt-1 text-sm text-danger">{errors.reason.message}</p>}
            </div>

            {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </form>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Historique</h2>
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune demande pour l'instant.</p>
        )}
        {!isLoading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.start_date} → {p.end_date}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{p.reason}</p>
                    {p.mentor_comment && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Commentaire du mentor : {p.mentor_comment}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[p.status]}`}
                  >
                    {statusLabels[p.status]}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}