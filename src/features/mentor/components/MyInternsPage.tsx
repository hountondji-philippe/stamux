import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useMentorInternsOverview } from '../hooks/use-mentor-interns-overview'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { MentorInternOverview } from '../../../types/mentor-intern-overview'

type FilterTab = 'all' | 'onTrack' | 'atRisk'

function isAtRisk(item: MentorInternOverview): boolean {
  if (item.presence_percent !== null && item.presence_percent < 70) return true
  if (item.tasks_total > 0 && item.tasks_done === 0) return true
  return false
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-base font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function InternOverviewCard({ item }: { item: MentorInternOverview }) {
  const progress = item.progress_percent ?? 0

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar name={item.intern.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{item.intern.name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.intern.email}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Progression</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <StatBlock value={item.presence_percent !== null ? `${item.presence_percent}%` : '—'} label="Presence" />
        <StatBlock value={`${item.tasks_done}/${item.tasks_total}`} label="Taches faites" />
        <StatBlock value={item.average_note !== null ? item.average_note.toFixed(1) : '—'} label="Note" />
      </div>

      <div className="mt-4 flex gap-2">
        <Link to={`/mes-stagiaires/${item.intern.id}`} className="flex-1">
          <Button variant="secondary" fullWidth>
            Voir profil
          </Button>
        </Link>
        <Link to="/messagerie" className="flex-1">
          <Button fullWidth>Message</Button>
        </Link>
      </div>
    </Card>
  )
}

export function MyInternsPage() {
  const { data, isLoading, isError } = useMentorInternsOverview()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')

  const items = data?.data ?? []

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.intern.name.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      if (tab === 'onTrack') return !isAtRisk(item)
      if (tab === 'atRisk') return isAtRisk(item)
      return true
    })
  }, [items, search, tab])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes stagiaires"
        description={`${items.length} stagiaire${items.length !== 1 ? 's' : ''} sous ton encadrement.`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un stagiaire..."
            className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60">
          {([
            { id: 'all', label: 'Tous' },
            { id: 'onTrack', label: 'En bonne voie' },
            { id: 'atRisk', label: 'A risque' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {isError && <p className="text-sm text-danger">Impossible de charger la liste.</p>}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Users}
          title="Aucun stagiaire"
          description={
            items.length === 0
              ? "Les stagiaires que l'administrateur t'assigne apparaitront ici."
              : 'Aucun resultat pour ce filtre.'
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <InternOverviewCard key={item.internship_id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}