import { useState } from 'react'
import { MapPin, Clock, LogOut, AlertCircle } from 'lucide-react'
import { useAttendanceHistory, useRecordAttendance, useRecordDeparture } from '../hooks/use-attendance'
import { useGeolocation } from '../hooks/use-geolocation'
import { Card } from '../../../components/ui/Card'

const PRESENCE_CUTOFF = '09:30'

const statusLabels: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'En retard',
  permission: 'Permission',
}

const statusStyles: Record<string, string> = {
  present: 'bg-success-light text-success',
  absent: 'bg-danger-light text-danger',
  late: 'bg-warning-light text-warning',
  permission: 'bg-primary-light text-primary-dark',
}

function isCurrentlyLate() {
  const now = new Date()
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return current > PRESENCE_CUTOFF
}

export function AttendancePage() {
  const { data, isLoading } = useAttendanceHistory()
  const { mutate: markPresence, isPending: isMarking, error: markError } = useRecordAttendance()
  const { mutate: markDeparture, isPending: isLeaving } = useRecordDeparture()
  const { getPosition, isLocating, error: geoError } = useGeolocation()

  const [lateReason, setLateReason] = useState('')
  const [lateProof, setLateProof] = useState<File | null>(null)
  const [showLateForm, setShowLateForm] = useState(false)

  const history = data?.data ?? []
  const today = new Date().toISOString().slice(0, 10)
  const todayRecord = history.find((a) => a.date === today)
  const late = isCurrentlyLate()

  const handleMarkPresence = async () => {
    if (late && !showLateForm) {
      setShowLateForm(true)
      return
    }

    try {
      const coords = await getPosition()
      markPresence({
        latitude: coords.latitude,
        longitude: coords.longitude,
        late_reason: late ? lateReason : undefined,
        late_proof: lateProof ?? undefined,
      })
      setShowLateForm(false)
    } catch {
      // erreur deja geree par useGeolocation, affichee via geoError
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mes presences</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pointe ton arrivee et ton depart chaque jour.</p>
      </div>

      <Card>
        {!todayRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Pas encore pointe aujourd'hui</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  La verification de position se fait au moment du pointage.
                </p>
              </div>
            </div>

            {late && !showLateForm && (
              <p className="flex items-center gap-2 text-sm text-warning">
                <AlertCircle size={16} />
                Il est passe {PRESENCE_CUTOFF}, tu seras marque en retard.
              </p>
            )}

            {showLateForm && (
              <div className="space-y-3 rounded-xl border border-warning-light bg-warning-light/40 p-4">
                <label htmlFor="late_reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Motif du retard
                </label>
                <textarea
                  id="late_reason"
                  value={lateReason}
                  onChange={(e) => setLateReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Explique brievement la raison de ton retard"
                />
                <div>
                  <label htmlFor="late_proof" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Justificatif (optionnel)
                  </label>
                  <input
                    id="late_proof"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setLateProof(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full text-sm text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>
            )}

            {geoError && <p className="text-sm text-danger">{geoError}</p>}
            {markError && (
              <p className="text-sm text-danger">
                Impossible d'enregistrer ta presence. Verifie que tu es bien dans le perimetre autorise.
              </p>
            )}

            <button
              onClick={handleMarkPresence}
              disabled={isLocating || isMarking || (showLateForm && !lateReason)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <Clock size={16} />
              {isLocating
                ? 'Verification de la position...'
                : isMarking
                  ? 'Enregistrement...'
                  : showLateForm
                    ? 'Confirmer ma presence'
                    : 'Marquer ma presence'}
            </button>
          </div>
        )}

        {todayRecord && (
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[todayRecord.status]}`}
              >
                {statusLabels[todayRecord.status]}
              </span>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Arrivee : {todayRecord.arrival_time ?? '—'}
                {todayRecord.departure_time && ` · Depart : ${todayRecord.departure_time}`}
              </p>
            </div>

            {!todayRecord.departure_time && (
              <button
                onClick={() => markDeparture(todayRecord.id)}
                disabled={isLeaving}
                className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 disabled:opacity-50"
              >
                <LogOut size={16} />
                {isLeaving ? 'Enregistrement...' : 'Marquer mon depart'}
              </button>
            )}
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Historique</h2>
        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune presence enregistree pour l'instant.</p>
        )}
        {!isLoading && history.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Arrivee</th>
                  <th className="px-6 py-3">Depart</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                    <td className="px-6 py-3 text-slate-900">{a.date}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.arrival_time ?? '—'}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{a.departure_time ?? '—'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[a.status]}`}
                      >
                        {statusLabels[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}