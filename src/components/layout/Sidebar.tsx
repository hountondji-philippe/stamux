import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ClipboardCheck,
  FileText,
  FolderKanban,
  FileStack,
  CalendarDays,
  CalendarClock,
  Settings,
  Shield,
  FileClock,
  MessageCircle,
  Lock,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'
import { usePlatformSettings } from '../../features/settings/hooks/use-settings'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

const navByRole: Record<string, NavItem[]> = {
  admin: [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { to: '/documents', label: 'Documents', icon: FileStack },
    { to: '/attendance', label: 'Presences', icon: ClipboardCheck },
    { to: '/reports', label: 'Rapports', icon: FileText },
    { to: '/admin/permissions', label: 'Permissions', icon: Lock },
    { to: '/admin/demandes-dates', label: 'Demandes de dates', icon: CalendarClock },
    { to: '/admin/stats', label: 'Statistiques', icon: Shield },
  ],
  mentor: [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/mes-stagiaires', label: 'Mes stagiaires', icon: Users },
    { to: '/attendance', label: 'Presences', icon: ClipboardCheck },
    { to: '/permissions', label: 'Permissions', icon: FileClock },
    { to: '/reports', label: 'Rapports', icon: FileText },
    { to: '/projects', label: 'Projets', icon: FolderKanban },
    { to: '/documents', label: 'Documents', icon: FileStack },
  ],
  intern: [
    { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/attendance', label: 'Mes presences', icon: ClipboardCheck },
    { to: '/permissions', label: 'Mes permissions', icon: FileClock },
    { to: '/reports', label: 'Mes rapports', icon: FileText },
    { to: '/projects', label: 'Mes projets', icon: FolderKanban },
    { to: '/documents', label: 'Mes documents', icon: FileStack },
  ],
}

const commonBottom: NavItem[] = [
  { to: '/mon-profil', label: 'Mon profil', icon: UserCircle },
  { to: '/messagerie', label: 'Messagerie', icon: MessageCircle },
  { to: '/events', label: 'Evenements', icon: CalendarDays },
  { to: '/profil', label: 'Parametres', icon: Settings },
]

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const role = useAuthStore((state) => state.user?.role)
  const items = role ? navByRole[role] : []
  const { data: platformData } = usePlatformSettings()
  const settings = platformData?.data

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
      isActive
        ? 'bg-primary-light text-primary-dark'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    }`

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col gap-6 border-r border-slate-200 bg-surface px-3 py-5 transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-xl object-contain" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
              {(settings?.platform_name ?? 'S').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {settings?.platform_name ?? 'STAMUX'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {settings?.tagline ?? 'Internship OS'}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose} className={linkClass}>
              <item.icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="my-3 border-t border-slate-200 dark:border-slate-800" />

          {commonBottom.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={onClose} className={linkClass}>
              <item.icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}