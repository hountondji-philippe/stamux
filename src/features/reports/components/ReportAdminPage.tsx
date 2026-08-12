import { useReportHistory } from '../hooks/use-reports'
import { Download } from 'lucide-react'
import { useDownloadReport } from '../hooks/use-reports'

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

export function ReportAdminPage() {
  const { data, isLoading } = useReportHistory()
  const { mutate: download } = useDownloadReport()

  const reports = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Rapports</h1>
        <p className="text-sm text-slate-500">
          Vue d'ensemble de tous les rapports. La validation se fait cote mentor.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Chargement...</p>}
      {!isLoading && reports.length === 0 && (
        <p className="text-sm text-slate-500">Aucun rapport pour l'instant.</p>
      )}

      {!isLoading && reports.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Stagiaire</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Periode</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{r.intern?.name}</td>
                  <td className="px-6 py-3 text-slate-600">{typeLabels[r.type]}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {r.period_start} → {r.period_end}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[r.status]}`}
                    >
                      {statusLabels[r.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => download(r.id)}
                      className="text-slate-500 hover:text-primary"
                      aria-label="Telecharger"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}