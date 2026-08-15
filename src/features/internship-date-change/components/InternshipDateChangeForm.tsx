import { useState } from 'react'
import { CalendarClock, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { useDateChangeHistory, useRequestDateChange } from '../hooks/use-internship-date-change'

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvee',
  rejected: 'Rejetee',
}

const statusTones: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export function InternshipDateChangeForm() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const { data: historyData } = useDateChangeHistory()
  const { mutate, isPending, error, isSuccess } = useRequestDateChange()

  const history = historyData?.data ?? []
  const hasPending = history.some((r) => r.status === 'pending')

  function handleSubmit() {
    mutate(
      { requested_start_date: startDate, requested_end_date: endDate, reason },
      {
        onSuccess: () => {
          setStartDate('')
          setEndDate('')
          setReason('')
        },
      }
    )
  }

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock size={18} className="text-primary" />
        <p className="font-semibold text-slate-900 dark:text-slate-100">Modifier les dates de mon stage</p>
      </div>

      {hasPending ? (
        <div className="flex items-center gap-3 rounded-lg bg-warning-light p-4 text-sm text-warning">
          <Clock size={18} />
          <p>Une demande est deja en attente de validation. Tu recevras une reponse prochainement.</p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Un imprevu, besoin de prolonger ou de reduire la duree de ton stage ? Soumets une demande, elle sera examinee par l'administration.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nouvelle date de debut</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nouvelle date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif de la demande"
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          {error && <p className="mt-3 text-sm text-danger">{getApiErrorMessage(error)}</p>}
          {isSuccess && (
            <p className="mt-3 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 size={16} /> Demande envoyee avec succes.
            </p>
          )}

          <Button
            className="mt-4 w-full"
            disabled={isPending || !startDate || !endDate || !reason}
            onClick={handleSubmit}
          >
            {isPending ? 'Envoi...' : 'Soumettre la demande'}
          </Button>
        </>
      )}

      {history.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Historique</p>
          <div className="space-y-2">
            {history.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300">
                  {r.requested_start_date} au {r.requested_end_date}
                </span>
                <Badge tone={statusTones[r.status]}>{statusLabels[r.status]}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}