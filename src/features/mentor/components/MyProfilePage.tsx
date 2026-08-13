import { useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import { useAuthStore } from '../../../store/auth-store'
import { useMe, useUpdateProfile, useUploadAvatar } from '../../settings/hooks/use-settings'
import { useProfileOverview, useUpdateProfileDetails } from '../../settings/hooks/use-profile-overview'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Avatar } from '../../../components/ui/Avatar'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { roleLabels } from '../../../lib/utils/role-labels'

function formatActivityLabel(action: string): string {
  const labels: Record<string, string> = {
    report_validated: 'Rapport valide',
    message_sent: 'Message envoye',
    task_completed: 'Tache terminee',
    document_approved: 'Document approuve',
  }
  return labels[action] ?? action
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "a l'instant"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} j`
}

export function MyProfilePage() {
  const role = useAuthStore((state) => state.user?.role)
  const { data: meData } = useMe()
  const { data: overviewData } = useProfileOverview()
  const { mutate: updateProfile, isPending: isSavingProfile } = useUpdateProfile()
  const { mutate: updateDetails, isPending: isSavingDetails, error: detailsError } = useUpdateProfileDetails()
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()

  const user = meData?.data
  const overview = overviewData?.data

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [company, setCompany] = useState('')
  const [department, setDepartment] = useState('')
  const [availability, setAvailability] = useState(true)
  const [maxCapacity, setMaxCapacity] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone ?? '')
      setBio(user.bio ?? '')
      setCompany(user.company ?? '')
      setDepartment(user.department ?? '')
      setAvailability(user.availability)
      setMaxCapacity(user.max_capacity !== null ? String(user.max_capacity) : '')
    }
  }, [user])

  if (!user) return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>

  const isMentor = role === 'mentor'
  const isPending = isSavingProfile || isSavingDetails

  const handleSave = () => {
    updateProfile({ name, phone: phone || null })
    updateDetails(
      {
        bio: bio || null,
        company: company || null,
        department: department || null,
        availability,
        max_capacity: maxCapacity ? Number(maxCapacity) : null,
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        description="Gere tes informations et tes preferences d'encadrement."
        action={
          <Button disabled={isPending} onClick={handleSave}>
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <p className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Informations personnelles</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nom complet" htmlFor="my-name">
                <TextInput id="my-name" value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>
              <FormField label="Telephone" htmlFor="my-phone">
                <TextInput id="my-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 ..." />
              </FormField>
              {isMentor && (
                <>
                  <FormField label="Entreprise" htmlFor="my-company">
                    <TextInput id="my-company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </FormField>
                  <FormField label="Departement encadre" htmlFor="my-department">
                    <TextInput id="my-department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </FormField>
                </>
              )}
            </div>
            <div className="mt-4">
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Bio</p>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            {detailsError && <p className="mt-3 text-sm text-danger">{getApiErrorMessage(detailsError)}</p>}
            {saved && <p className="mt-3 text-sm text-success">Profil mis a jour avec succes.</p>}
          </Card>

          {isMentor && (
            <Card>
              <p className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Disponibilite</p>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Disponible pour de nouveaux stagiaires</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visible par l'equipe pedagogique lors des affectations</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={availability}
                  onClick={() => setAvailability(!availability)}
                  style={{ backgroundColor: availability ? '#16a34a' : '#cbd5e1' }}
                  className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-0 p-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    style={{ transform: availability ? 'translateX(20px)' : 'translateX(2px)' }}
                    className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                  />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Capacite maximale</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nombre de stagiaires encadres simultanement</p>
                </div>
                <select
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="h-10 w-32 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Non defini</option>
                  {[2, 4, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
                <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-dark">
                  <Camera size={13} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadAvatar(file)
                    }}
                  />
                </label>
              </div>
              <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
              {(company || department) && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {[company, department].filter(Boolean).join(' — ')}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Badge tone="success">Role : {roleLabels[user.role]}</Badge>
                {overview?.stats?.note_moyenne !== null && overview?.stats?.note_moyenne !== undefined && (
                  <Badge tone="warning">★ {overview.stats.note_moyenne}</Badge>
                )}
              </div>
            </div>
          </Card>

          {overview?.stats && (
            <Card>
              <p className="mb-4 font-semibold text-slate-900 dark:text-slate-100">En un coup d'oeil</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{overview.stats.stagiaires}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Stagiaires</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{overview.stats.rapports_valides}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rapports valides</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {overview.stats.note_moyenne ?? '—'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Note moyenne</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <p className="mb-4 font-semibold text-slate-900 dark:text-slate-100">Activite recente</p>
            {(!overview?.recent_activity || overview.recent_activity.length === 0) && (
              <p className="text-sm text-slate-400">Aucune activite recente.</p>
            )}
            <div className="space-y-3">
              {overview?.recent_activity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{formatActivityLabel(item.action)}</span>
                  <span className="text-xs text-slate-400">{formatRelativeTime(item.created_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}