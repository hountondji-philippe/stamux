import { useEffect, useState } from 'react'
import { User as UserIcon, Lock, Building2, Camera, Image, Palette, Upload, Bell, Sun } from 'lucide-react'
import { useAuthStore } from '../../../store/auth-store'
import { useThemeStore } from '../../../store/theme-store'
import {
  useMe,
  useUpdateProfile,
  useUpdatePassword,
  useUploadAvatar,
  useUpdatePreferences,
  usePlatformSettings,
  useUpdatePlatformSettings,
  useUploadLogo,
  useUploadFavicon,
} from '../hooks/use-settings'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Avatar } from '../../../components/ui/Avatar'
import { getApiErrorMessage } from '../../../lib/utils/api-error'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'platform'
type PlatformSubTab = 'general' | 'design'
type ThemeValue = 'light' | 'dark' | 'auto'

const languages = [
  { value: 'fr', label: 'Francais' },
  { value: 'en', label: 'English' },
]

function ProfileTab() {
  const { data } = useMe()
  const { mutate, isPending, error } = useUpdateProfile()
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const user = data?.data

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('fr')
  const [timezone, setTimezone] = useState('Africa/Porto-Novo')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone ?? '')
      setLanguage(user.language)
      setTimezone(user.timezone)
    }
  }, [user])

  if (!user) return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar name={user.name} size="lg" />
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
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nom complet" htmlFor="name">
          <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Telephone" htmlFor="phone">
          <TextInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 ..." />
        </FormField>
        <FormField label="Langue" htmlFor="language">
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Fuseau horaire" htmlFor="timezone">
          <TextInput id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </FormField>
      </div>

      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
      {saved && <p className="text-sm text-success">Profil mis a jour avec succes.</p>}

      <Button
        disabled={isPending}
        onClick={() =>
          mutate(
            { name, phone: phone || null, language, timezone },
            { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
          )
        }
      >
        {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </Button>
    </div>
  )
}

function SecurityTab() {
  const { mutate, isPending, error, isSuccess } = useUpdatePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const mismatch = password.length > 0 && confirmation.length > 0 && password !== confirmation

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Change ton mot de passe. Tu devras te reconnecter sur tes autres appareils.
      </p>
      <FormField label="Mot de passe actuel" htmlFor="current-password">
        <TextInput
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </FormField>
      <FormField label="Nouveau mot de passe" htmlFor="new-password">
        <TextInput id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      <FormField label="Confirmer le nouveau mot de passe" htmlFor="confirm-password">
        <TextInput
          id="confirm-password"
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </FormField>

      {mismatch && <p className="text-sm text-danger">Les mots de passe ne correspondent pas.</p>}
      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
      {isSuccess && <p className="text-sm text-success">Mot de passe mis a jour avec succes.</p>}

      <Button
        disabled={isPending || mismatch || !currentPassword || !password || !confirmation}
        onClick={() =>
          mutate(
            { current_password: currentPassword, password, password_confirmation: confirmation },
            {
              onSuccess: () => {
                setCurrentPassword('')
                setPassword('')
                setConfirmation('')
              },
            }
          )
        }
      >
        {isPending ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
      </Button>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function NotificationsTab() {
  const { data } = useMe()
  const { mutate, isPending, error } = useUpdatePreferences()
  const user = data?.data
  const [saved, setSaved] = useState(false)

  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(true)
  const [notifyAttendance, setNotifyAttendance] = useState(true)

  useEffect(() => {
    if (user) {
      setNotifyEmail(user.notify_email)
      setNotifyPush(user.notify_push)
      setNotifyAttendance(user.notify_attendance_reminder)
    }
  }, [user])

  if (!user) return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>

  const save = (overrides: Partial<{ notify_email: boolean; notify_push: boolean; notify_attendance_reminder: boolean }>) => {
    mutate(
      {
        notify_email: notifyEmail,
        notify_push: notifyPush,
        notify_attendance_reminder: notifyAttendance,
        ...overrides,
      },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
    )
  }

  return (
    <div className="max-w-lg divide-y divide-slate-100 dark:divide-slate-800">
      <ToggleRow
        title="Notifications par e-mail"
        description="Validation de rapport, messages, rappels de deadline"
        checked={notifyEmail}
        onChange={(v) => { setNotifyEmail(v); save({ notify_email: v }) }}
      />
      <ToggleRow
        title="Notifications push"
        description="Alertes en temps reel dans l'application"
        checked={notifyPush}
        onChange={(v) => { setNotifyPush(v); save({ notify_push: v }) }}
      />
      <ToggleRow
        title="Rappel de pointage"
        description="Recevoir un rappel si le pointage du jour est manquant"
        checked={notifyAttendance}
        onChange={(v) => { setNotifyAttendance(v); save({ notify_attendance_reminder: v }) }}
      />

      {error && <p className="mt-3 text-sm text-danger">{getApiErrorMessage(error)}</p>}
      {saved && !isPending && <p className="mt-3 text-sm text-success">Preferences enregistrees.</p>}
    </div>
  )
}

function AppearanceTab() {
  const { mutate, isPending, error } = useUpdatePreferences()
  const storeTheme = useThemeStore((state) => state.theme)
  const setStoreTheme = useThemeStore((state) => state.setTheme)
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Theme</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choisis l'apparence de ton interface</p>
        </div>
        <select
          value={storeTheme}
          onChange={(e) => {
            const value = e.target.value as ThemeValue
            setStoreTheme(value)
            mutate(
              { theme: value },
              { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000) } }
            )
          }}
          className="h-10 w-40 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="auto">Automatique</option>
        </select>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{getApiErrorMessage(error)}</p>}
      {saved && !isPending && <p className="mt-3 text-sm text-success">Theme enregistre.</p>}
    </div>
  )
}

function LogoFaviconUploader({
  label,
  currentUrl,
  accept,
  hint,
  onUpload,
  isUploading,
}: {
  label: string
  currentUrl: string | null
  accept: string
  hint: string
  onUpload: (file: File) => void
  isUploading: boolean
}) {
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (file) onUpload(file)
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors ${
          dragOver
            ? 'border-primary bg-primary-light/40'
            : 'border-slate-300 hover:border-primary/60 dark:border-slate-700'
        }`}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="h-full w-full object-contain" />
          ) : (
            <Image size={20} className="text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Upload size={14} />
            {isUploading ? 'Envoi en cours...' : 'Glisse un fichier ou clique pour parcourir'}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const isValid = /^#[0-9A-Fa-f]{6}$/.test(value)

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <div className="flex items-center gap-2">
        <label
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-700"
          style={{ backgroundColor: isValid ? value : '#e2e8f0' }}
        >
          <input
            type="color"
            value={isValid ? value : '#000000'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="h-0 w-0 opacity-0"
          />
        </label>
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="#000000"
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}

function PlatformTab() {
  const { data } = usePlatformSettings()
  const { mutate, isPending, error } = useUpdatePlatformSettings()
  const { mutate: uploadLogo, isPending: isUploadingLogo } = useUploadLogo()
  const { mutate: uploadFavicon, isPending: isUploadingFavicon } = useUploadFavicon()
  const settings = data?.data

  const [subTab, setSubTab] = useState<PlatformSubTab>('general')

  const [platformName, setPlatformName] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [tagline, setTagline] = useState('')
  const [defaultLanguage, setDefaultLanguage] = useState('fr')
  const [timezone, setTimezone] = useState('Africa/Porto-Novo')
  const [contactEmail, setContactEmail] = useState('')
  const [savedGeneral, setSavedGeneral] = useState(false)

  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [secondaryColor, setSecondaryColor] = useState('#4F46E5')
  const [successColor, setSuccessColor] = useState('#10B981')
  const [errorColor, setErrorColor] = useState('#EF4444')
  const [bgPrimaryColor, setBgPrimaryColor] = useState('#FFFFFF')
  const [bgSecondaryColor, setBgSecondaryColor] = useState('#F8FAFC')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontScale, setFontScale] = useState(1)
  const [savedDesign, setSavedDesign] = useState(false)

  useEffect(() => {
    if (settings) {
      setPlatformName(settings.platform_name)
      setInstitutionName(settings.institution_name ?? '')
      setTagline(settings.tagline ?? '')
      setDefaultLanguage(settings.default_language)
      setTimezone(settings.timezone)
      setContactEmail(settings.contact_email ?? '')
      setPrimaryColor(settings.primary_color)
      setSecondaryColor(settings.secondary_color)
      setSuccessColor(settings.success_color)
      setErrorColor(settings.error_color)
      setBgPrimaryColor(settings.background_primary_color)
      setBgSecondaryColor(settings.background_secondary_color)
      setFontFamily(settings.font_family)
      setFontScale(settings.font_scale)
    }
  }, [settings])

  if (!settings) return <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>

  const subTabs: { id: PlatformSubTab; label: string; icon: typeof Building2 }[] = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'design', label: 'Design', icon: Palette },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              subTab === t.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'general' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ces parametres s'appliquent a l'ensemble de la plateforme.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nom de la plateforme" htmlFor="platform-name">
              <TextInput id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </FormField>
            <FormField label="Etablissement" htmlFor="institution-name">
              <TextInput id="institution-name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
            </FormField>
            <FormField label="Slogan (optionnel)" htmlFor="tagline">
              <TextInput id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Internship OS" />
            </FormField>
            <FormField label="Langue par defaut" htmlFor="default-language">
              <select
                id="default-language"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Fuseau horaire" htmlFor="platform-timezone">
              <TextInput id="platform-timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </FormField>
            <FormField label="E-mail de contact" htmlFor="contact-email">
              <TextInput id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </FormField>
          </div>

          {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
          {savedGeneral && <p className="text-sm text-success">Parametres enregistres avec succes.</p>}

          <Button
            disabled={isPending}
            onClick={() =>
              mutate(
                {
                  platform_name: platformName,
                  institution_name: institutionName || null,
                  tagline: tagline || null,
                  default_language: defaultLanguage,
                  timezone,
                  contact_email: contactEmail || null,
                },
                { onSuccess: () => { setSavedGeneral(true); setTimeout(() => setSavedGeneral(false), 3000) } }
              )
            }
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer les parametres'}
          </Button>
        </div>
      )}

      {subTab === 'design' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LogoFaviconUploader
              label="Logo"
              currentUrl={settings.logo_url}
              accept="image/png,image/jpeg,image/svg+xml"
              hint="PNG, JPG ou SVG, 1 Mo max"
              onUpload={uploadLogo}
              isUploading={isUploadingLogo}
            />
            <LogoFaviconUploader
              label="Favicon"
              currentUrl={settings.favicon_url}
              accept="image/png,image/jpeg,image/x-icon"
              hint="PNG, JPG ou ICO, 512 Ko max"
              onUpload={uploadFavicon}
              isUploading={isUploadingFavicon}
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Couleurs de fond</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Arriere-plan principal" value={bgPrimaryColor} onChange={setBgPrimaryColor} />
              <ColorField label="Arriere-plan secondaire" value={bgSecondaryColor} onChange={setBgSecondaryColor} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Couleurs d'action</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Primaire" value={primaryColor} onChange={setPrimaryColor} />
              <ColorField label="Secondaire" value={secondaryColor} onChange={setSecondaryColor} />
              <ColorField label="Succes" value={successColor} onChange={setSuccessColor} />
              <ColorField label="Erreur" value={errorColor} onChange={setErrorColor} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Typographie</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Police" htmlFor="font-family">
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </FormField>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Taille du texte ({Math.round(fontScale * 100)}%)
                </p>
                <input
                  type="range"
                  min={0.85}
                  max={1.25}
                  step={0.05}
                  value={fontScale}
                  onChange={(e) => setFontScale(Number(e.target.value))}
                  className="h-10 w-full"
                />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            style={{ backgroundColor: bgPrimaryColor }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Apercu</p>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: bgSecondaryColor }}
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: primaryColor }}>
                  Bouton primaire
                </span>
                <span
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium"
                  style={{ borderColor: secondaryColor, color: secondaryColor }}
                >
                  Bouton secondaire
                </span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: successColor }}>
                  Succes
                </span>
                <span className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: errorColor }}>
                  Erreur
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Texte normal</p>
              <p className="text-sm font-medium" style={{ color: primaryColor }}>Texte accentue</p>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
          {savedDesign && <p className="text-sm text-success">Design enregistre avec succes.</p>}

          <Button
            disabled={isPending}
            onClick={() =>
              mutate(
                {
                  primary_color: primaryColor,
                  secondary_color: secondaryColor,
                  success_color: successColor,
                  error_color: errorColor,
                  background_primary_color: bgPrimaryColor,
                  background_secondary_color: bgSecondaryColor,
                  font_family: fontFamily,
                  font_scale: fontScale,
                },
                { onSuccess: () => { setSavedDesign(true); setTimeout(() => setSavedDesign(false), 3000) } }
              )
            }
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer le design'}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ProfilePage() {
  const role = useAuthStore((state) => state.user?.role)
  const [tab, setTab] = useState<Tab>('profile')

  const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'security', label: 'Securite', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Sun },
    ...(role === 'admin' ? [{ id: 'platform' as Tab, label: 'Plateforme', icon: Building2 }] : []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Parametres" description="Gere ton profil, ta securite et tes preferences." />

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'profile' && <ProfileTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'appearance' && <AppearanceTab />}
        {tab === 'platform' && role === 'admin' && <PlatformTab />}
      </Card>
    </div>
  )
}