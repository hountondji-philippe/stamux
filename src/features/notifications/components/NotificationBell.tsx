import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, Trash2 } from 'lucide-react'
import { useNotifications, type NotificationItem } from '../hooks/use-notifications'

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `il y a ${diffD} j`
}

const typeToRoute: Record<string, string> = {
  report_submitted: '/reports',
  report_validated: '/reports',
  permission_requested: '/permissions',
  permission_reviewed: '/permissions',
  document_requested: '/documents',
  document_ready: '/documents',
  document_mentor_approved: '/documents',
  document_rejected: '/documents',
  event_published: '/events',
  task_assigned: '/projects',
  task_status_updated: '/projects',
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, deleteOne, deleteAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmClearAll(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClickNotification = (n: NotificationItem) => {
    if (!n.read_at) markRead(n.id)
    setOpen(false)
    const target = typeToRoute[n.type]
    if (target) navigate(target)
  }

  const handleClearAll = () => {
    if (confirmClearAll) {
      deleteAll()
      setConfirmClearAll(false)
    } else {
      setConfirmClearAll(true)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} className="text-xs font-medium text-primary hover:underline">
                  Tout marquer comme lu
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className={`flex items-center gap-1 text-xs font-medium hover:underline ${
                    confirmClearAll ? 'text-danger' : 'text-slate-400'
                  }`}
                >
                  <Trash2 size={12} />
                  {confirmClearAll ? 'Confirmer ?' : 'Tout supprimer'}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-2 border-b border-slate-50 px-4 py-3 text-sm transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
                    !n.read_at ? 'bg-primary-light/30 dark:bg-primary/10' : ''
                  }`}
                >
                  <button onClick={() => handleClickNotification(n)} className="flex-1 text-left">
                    <p className="text-slate-700 dark:text-slate-200">{n.message}</p>
                    <span className="text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                  </button>
                  <button
                    onClick={() => deleteOne(n.id)}
                    className="mt-0.5 shrink-0 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700"
                    aria-label="Supprimer cette notification"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}