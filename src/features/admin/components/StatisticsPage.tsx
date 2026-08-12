import { Users, ClipboardCheck, FileText, FileStack, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { StatCard } from '../../../components/ui/StatCard'
import {
  useAdminOverview,
  useAdminAttendanceStats,
  useAdminReportStats,
  useAdminDocumentStats,
} from '../../dashboard/hooks/use-admin-stats'

function StatBar({ label, value, total, colorClass }: { label: string; value: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-600 dark:text-slate-300">{label}</p>
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {value} <span className="text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  )
}

function AttendancePanel() {
  const { data } = useAdminAttendanceStats()
  const stats = data?.data

  if (!stats || stats.total === 0) {
    return <EmptyPanel title="Presences" text="Aucun pointage enregistre pour le moment." />
  }

  const present = Math.round((stats.present_rate / 100) * stats.total)
  const late = Math.round((stats.late_rate / 100) * stats.total)
  const absent = Math.round((stats.absent_rate / 100) * stats.total)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Presences ({stats.total} pointages)</h3>
      <div className="space-y-3">
        <StatBar label="Present" value={present} total={stats.total} colorClass="bg-success" />
        <StatBar label="En retard" value={late} total={stats.total} colorClass="bg-warning" />
        <StatBar label="Absent" value={absent} total={stats.total} colorClass="bg-danger" />
      </div>
    </div>
  )
}

function ReportsPanel() {
  const { data } = useAdminReportStats()
  const stats = data?.data

  if (!stats || stats.total === 0) {
    return <EmptyPanel title="Rapports" text="Aucun rapport depose pour le moment." />
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Rapports ({stats.total} deposes)</h3>
      <div className="space-y-3">
        <StatBar label="En attente" value={stats.pending} total={stats.total} colorClass="bg-warning" />
        <StatBar label="Valides" value={stats.validated} total={stats.total} colorClass="bg-success" />
        <StatBar label="Rejetes" value={stats.rejected} total={stats.total} colorClass="bg-danger" />
      </div>
    </div>
  )
}

function DocumentsPanel() {
  const { data } = useAdminDocumentStats()
  const stats = data?.data

  if (!stats || stats.total === 0) {
    return <EmptyPanel title="Documents" text="Aucune demande de document pour le moment." />
  }

  const rejected = stats.mentor_rejected + stats.admin_rejected

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Documents ({stats.total} demandes)</h3>
      <div className="space-y-3">
        <StatBar label="En attente" value={stats.pending} total={stats.total} colorClass="bg-warning" />
        <StatBar label="Approuves mentor" value={stats.mentor_approved} total={stats.total} colorClass="bg-primary" />
        <StatBar label="Termines" value={stats.completed} total={stats.total} colorClass="bg-success" />
        <StatBar label="Rejetes" value={rejected} total={stats.total} colorClass="bg-danger" />
      </div>
    </div>
  )
}

export function StatisticsPage() {
  const { data: overviewData } = useAdminOverview()
  const overview = overviewData?.data

  return (
    <div className="space-y-6">
      <PageHeader title="Statistiques" description="Vue d'ensemble chiffree de l'activite sur la plateforme." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Stagiaires actifs" value={String(overview?.active_interns ?? 0)} icon={Users} accent="primary" />
        <StatCard label="Stages termines" value={String(overview?.completed_internships ?? 0)} icon={ClipboardCheck} accent="success" />
        <StatCard label="Rapports en attente" value={String(overview?.pending_reports ?? 0)} icon={FileText} accent="warning" />
        <StatCard label="Documents en attente" value={String(overview?.pending_documents ?? 0)} icon={FileStack} accent="warning" />
        <StatCard label="Presence moyenne" value={`${overview?.average_attendance_rate ?? 0}%`} icon={TrendingUp} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AttendancePanel />
        <ReportsPanel />
        <DocumentsPanel />
      </div>
    </div>
  )
}