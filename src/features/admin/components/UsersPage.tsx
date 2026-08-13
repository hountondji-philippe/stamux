import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UserCog, Search, Shield, GraduationCap, Users as UsersIcon } from 'lucide-react'
import { useUsers } from '../hooks/use-users'
import { CreateUserForm } from './CreateUserForm'
import { AssignMentorModal } from './AssignMentorModal'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Avatar } from '../../../components/ui/Avatar'
import { Card } from '../../../components/ui/Card'
import { StatCard } from '../../../components/ui/StatCard'
import { roleLabels } from '../../../lib/utils/role-labels'
import type { User } from '../../../types/user'

const statusTones = {
  active: 'success',
  pending: 'warning',
  inactive: 'neutral',
} as const

const statusLabels: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  inactive: 'Inactif',
}

const roleTones = {
  admin: 'danger',
  mentor: 'success',
  intern: 'primary',
} as const

const filters = [
  { key: 'all', label: 'Tous' },
  { key: 'admin', label: 'Admins' },
  { key: 'mentor', label: 'Mentors' },
  { key: 'intern', label: 'Stagiaires' },
] as const

export function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]['key']>('all')
  const navigate = useNavigate()
  const { data, isLoading, isError } = useUsers()

  const users = data?.data ?? []
  const mentors = users.filter((u) => u.role === 'mentor' && u.status === 'active')

  const counts = useMemo(
    () => ({
      admin: users.filter((u) => u.role === 'admin').length,
      mentor: users.filter((u) => u.role === 'mentor').length,
      intern: users.filter((u) => u.role === 'intern').length,
    }),
    [users]
  )

  const visible = users.filter((u) => {
    const matchesRole = activeFilter === 'all' || u.role === activeFilter
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchesRole && matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description={`${users.length} compte${users.length !== 1 ? 's' : ''} · 3 roles`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Nouveau compte
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Administrateurs" value={String(counts.admin)} icon={Shield} accent="danger" />
        <StatCard label="Mentors" value={String(counts.mentor)} icon={UsersIcon} accent="success" />
        <StatCard label="Stagiaires" value={String(counts.intern)} icon={GraduationCap} accent="primary" />
      </div>

      <Card noPadding className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  activeFilter === f.key
                    ? 'border-transparent bg-primary-light text-primary-dark'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Chargement...</p>}
        {isError && <p className="text-sm text-danger">Impossible de charger la liste des utilisateurs.</p>}

        {!isLoading && !isError && visible.length === 0 && (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur"
            description="Cree ton premier compte mentor ou stagiaire pour commencer."
          />
        )}

        {!isLoading && !isError && visible.length > 0 && (
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/5">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Mentor assigne
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                    Statut
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((user) => (
                  <tr key={user.id} onClick={() => navigate(`/admin/utilisateurs/${user.id}`)} className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} size="sm" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTones[user.role]}>{roleLabels[user.role]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 dark:text-slate-500">
                      {user.role === 'intern' ? (
                        user.assigned_mentor ? (
                          user.assigned_mentor.name
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Non assigne</span>
                        )
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTones[user.status]}>{statusLabels[user.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role === 'intern' && (
                        <Button
                          variant="secondary"
                          icon={<UserCog size={14} />}
                          onClick={(e) => { e.stopPropagation(); setAssignTarget(user) }}
                          className="!px-3 !py-1.5 text-xs"
                        >
                          {user.assigned_mentor ? 'Reassigner' : 'Assigner'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Creer un compte">
        <CreateUserForm onSuccess={() => setModalOpen(false)} />
      </Modal>

      <AssignMentorModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        intern={assignTarget}
        mentors={mentors}
      />
    </div>
  )
}