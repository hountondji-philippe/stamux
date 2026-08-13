import { usePlatformSettings } from '../../features/settings/hooks/use-settings'
import { readBrandCache } from '../../lib/theme/brand-cache'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ message = 'Veuillez patienter', fullScreen = true }: LoadingScreenProps) {
  const { data: platformData } = usePlatformSettings()
  const cached = readBrandCache()

  const logoUrl = platformData?.data.logo_url ?? cached?.logo_url ?? null
  const platformName = platformData?.data.platform_name ?? cached?.platform_name ?? 'S'

  const card = (
    <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-slate-900">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-12 w-12 object-contain" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
          {platformName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>

      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Chargement en cours...</p>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>
    </div>
  )

  if (!fullScreen) {
    return <div className="flex items-center justify-center py-10">{card}</div>
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      {card}
    </div>
  )
}