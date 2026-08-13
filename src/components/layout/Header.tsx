import { Menu, LogOut, Sun, Moon, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth-store'
import { useThemeStore } from '../../store/theme-store'
import { roleLabels } from '../../lib/utils/role-labels'
import { useUnreadCount } from '../../features/messaging/hooks/use-messaging'
import { NotificationBell } from '../../features/notifications/components/NotificationBell'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const { data: unreadData } = useUnreadCount()
  const unread = unreadData?.data.unread ?? 0

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-surface px-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Changer de theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          onClick={() => navigate('/messagerie')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Messagerie"
        >
          <MessageCircle size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <NotificationBell />
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4 dark:border-slate-800">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user ? roleLabels[user.role] : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-danger-light hover:text-danger focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-400"
          aria-label="Deconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}