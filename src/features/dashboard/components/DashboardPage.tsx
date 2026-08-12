import { Users, ClipboardCheck, FileText, CheckCircle2, Clock, XCircle, CalendarClock } from 'lucide-react'
import { StatCard } from '../../../components/ui/StatCard'
import { useAuthStore } from '../../../store/auth-store'
import { useUsers } from '../../admin/hooks/use-users'
import { useAttendanceDashboard } from '../../attendance/hooks/use-attendance-dashboard'
import { useAttendanceHistory } from '../../attendance/hooks/use-attendance'
import { usePermissionHistory } from '../../permissions/hooks/use-permissions'
import { useReportHistory } from '../../reports/hooks/use-reports'
import { useProjects } from '../../projects/hooks/use-projects'
import {
  useAdminOverview,
  useAdminAttendanceStats,
  useAdminReportStats,
  useAdminDocumentStats,
} from '../hooks/use-admin-stats'

function Hero({ name }: { name: string }) {
  return (
    <div className="rounded-2xl bg-gradient-brand p-8 text-white shadow-lg">
      <p className="text-sm font-medium text-white/80">Bon retour</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{name}</h1>
      <p className="mt-2 max-w-lg text-sm text-white/80">
        Voici un apercu de l'activite sur la plateforme aujourd'hui.
      </p>
    </div>
  )
}

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

function AttendancePanel({ averageRate }: { averageRate?: number }) {
  const { data } = useAdminAttendanceStats()
  const stats = data?.data

  if (!stats || stats.total === 0) {
    return <EmptyPanel title="Presences (global)" text="Aucun pointage enregistre pour le moment." />
  }

  const present = Math.round((stats.present_rate / 100) * stats.total)
  const late = Math.round((stats.late_rate / 100) * stats.total)
  const absent = Math.round((stats.absent_rate / 100) * stats.total)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Presences (global)</h3>
        {averageRate !== undefined && (
          <span className="text-xs font-medium text-slate-400">{averageRate}% en moyenne</span>
        )}
      </div>
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
    return <EmptyPanel title="Rapports (global)" text="Aucun rapport depose pour le moment." />
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Rapports (global)</h3>
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
    return <EmptyPanel title="Documents (global)" text="Aucune demande de document pour le moment." />
  }

  const rejected = stats.mentor_rejected + stats.admin_rejected

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Documents (global)</h3>
      <div className="space-y-3">
        <StatBar label="En attente" value={stats.pending} total={stats.total} colorClass="bg-warning" />
        <StatBar label="Approuves mentor" value={stats.mentor_approved} total={stats.total} colorClass="bg-primary" />
        <StatBar label="Termines" value={stats.completed} total={stats.total} colorClass="bg-success" />
        <StatBar label="Rejetes" value={rejected} total={stats.total} colorClass="bg-danger" />
      </div>
    </div>
  )
}

function AdminDashboard({ name }: { name: string }) {
  const { data: usersData } = useUsers()
  const { data: overviewData } = useAdminOverview()
  const users = usersData?.data ?? []
  const interns = users.filter((u) => u.role === 'intern' && u.status === 'active').length
  const mentors = users.filter((u) => u.role === 'mentor' && u.status === 'active').length
  const pending = users.filter((u) => u.status === 'pending').length
  const overview = overviewData?.data

  return (
    <div className="space-y-6">
      <Hero name={name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Stagiaires actifs" value={String(interns)} icon={Users} accent="primary" />
        <StatCard label="Mentors actifs" value={String(mentors)} icon={Users} accent="success" />
        <StatCard label="Comptes en attente" value={String(pending)} icon={Clock} accent="warning" />
        <StatCard label="Total comptes" value={String(users.length)} icon={ClipboardCheck} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AttendancePanel averageRate={overview?.average_attendance_rate} />
        <ReportsPanel />
        <DocumentsPanel />
      </div>
    </div>
  )
}

function MentorDashboard({ name }: { name: string }) {
  const { data: attData } = useAttendanceDashboard()
  const { data: reportsData } = useReportHistory()

  const attendances = attData?.data.attendances ?? []
  const today = new Date().toISOString().slice(0, 10)
  const todayRecords = attendances.filter((a)=> a.date === today)
  const presentToday = todayRecords.filter((a) => a.status === 'present').length
  const lateToday = todayRecords.filter((a) => a.status === 'late').length
  const absentToday = todayRecords.filter((a)=> a.status === 'absent').length

  const reports = reportsData?.data ?? []
  const pendingReports = reports.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <Hero name={name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Presents aujourd'hui" value={String(presentToday)} icon={CheckCircle2} accent="success" />
        <StatCard label="En retard" value={String(lateToday)} icon={Clock} accent="warning"/>
        <StatCard label="Absents" value={String(absentToday)} icon={XCircle} accent="danger" />
        <StatCard label="Rapports a valider" value={String(pendingReports)} icon={FileText}accent="primary" />
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day:'numeric', month: 'long' })
}

function daysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function NextDeadline({ reports, projects }: { reports: { period_end: string; status: string }[]; projects: { end_date: string | null; status: string }[] }) {
  const candidates: { label: string; date: string }[] = []

  reports
    .filter((r) => r.status === 'pending')
    .forEach((r) => candidates.push({ label: 'Rapport a rendre', date: r.period_end }))

  projects
    .filter((p) => p.status !== 'completed' && p.end_date)
    .forEach((p) => candidates.push({ label: 'Fin de projet', date: p.end_date as string }))

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = candidates
    .filter((c) => c.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  if (!upcoming) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune echeance a venir pour le moment.</p>
      </div>
    )
  }

  const days = daysUntil(upcoming.date)

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="flex h-11 w-11 shrink-0items-center justify-center rounded-xl bg-warning-light text-warning">
        <CalendarClock size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{upcoming.label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {formatDate(upcoming.date)} {days === 0 ? "· aujourd'hui" : days === 1 ? '· demain' : `· dans ${days} jours`}
        </p>
      </div>
    </div>
  )
}

function WeeklyProgress({ projects }: { projects: { progress: number; status: string }[] }){
  const active = projects.filter((p) => p.status !== 'completed' && p.status !== 'archived')

  if (active.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
        <p className="text-sm text-slate-500 dark:text-slate-400">Aucun projet en cours.</p>
      </div>
    )
  }

  const average = Math.round(active.reduce((sum, p) => sum + p.progress, 0) / active.length)

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Progression moyenne</p>
        <span className="font-medium text-slate-500 dark:text-slate-400">{average}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${average}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-400">{active.length} projet{active.length !== 1? 's' : ''} en cours</p>
    </div>
  )
}

function InternDashboard({ name }: { name: string }) {
  const { data: attData } = useAttendanceHistory()
  const { data: permData } = usePermissionHistory()
  const { data: reportsData } = useReportHistory()
  const { data: projectsData } = useProjects()

  const attendances = attData?.data ?? []
  const today = new Date().toISOString().slice(0, 10)
  const todayStatus = attendances.find((a) =>a.date === today)?.status

  const permissions = permData?.data ?? []
  const pendingPermissions = permissions.filter((p) => p.status === 'pending').length

  const reports = reportsData?.data ?? []
  const pendingReports = reports.filter((r) => r.status === 'pending').length
  const validatedReports = reports.filter((r)=> r.status === 'validated').length

  const projects = projectsData?.data ?? []

  const statusLabel: Record<string, string> ={
    present: 'Present',
    late: 'En retard',
    absent: 'Absent',
    permission: 'Permission',
  }

  return (
    <div className="space-y-6">
      <Hero name={name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Statut aujourd'hui"
          value={todayStatus ? statusLabel[todayStatus] : 'Pas pointe'}
          icon={ClipboardCheck}
          accent={todayStatus === 'present' ?'success' : 'warning'}
        />
        <StatCard label="Permissions en attente" value={String(pendingPermissions)} icon={Clock} accent="warning" />
        <StatCard label="Rapports en attente"value={String(pendingReports)} icon={FileText} accent="warning" />
        <StatCard label="Rapports valides" value={String(validatedReports)} icon={CheckCircle2} accent="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NextDeadline reports={reports} projects={projects} />
        <WeeklyProgress projects={projects} />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const name = user?.name ?? 'Utilisateur'

  if (user?.role === 'admin') return <AdminDashboard name={name} />
  if (user?.role === 'mentor') return <MentorDashboard name={name} />
  return <InternDashboard name={name} />
}