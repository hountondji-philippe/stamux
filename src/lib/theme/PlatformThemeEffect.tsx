import { useEffect } from 'react'
import { usePlatformSettings } from '../../features/settings/hooks/use-settings'
import { darken, lighten } from './color-utils'
import { saveBrandCache } from './brand-cache'

export function PlatformThemeEffect() {
  const { data } = usePlatformSettings()
  const settings = data?.data

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement.style
    root.setProperty('--color-primary', settings.primary_color)
    root.setProperty('--color-primary-dark', darken(settings.primary_color, 0.18))
    root.setProperty('--color-primary-light', lighten(settings.primary_color, 0.85))
    root.setProperty('--color-secondary', settings.secondary_color)
    root.setProperty('--color-success', settings.success_color)
    root.setProperty('--color-success-light', lighten(settings.success_color, 0.85))
    root.setProperty('--color-danger', settings.error_color)
    root.setProperty('--color-danger-light', lighten(settings.error_color, 0.85))
    root.setProperty(
      '--background-image-gradient-brand',
      `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color} 100%)`
    )
    root.setProperty('--color-surface', settings.background_primary_color)
    root.setProperty('--color-surface-alt', settings.background_secondary_color)
    if (settings.font_family) {
      document.body.style.fontFamily = `"${settings.font_family}", ui-sans-serif, system-ui, sans-serif`
    }
    if (settings.font_scale) {
      document.documentElement.style.fontSize = `${settings.font_scale * 100}%`
    }
  }, [settings])

  useEffect(() => {
    if (!settings) return
    if (settings.platform_name) {
      document.title = settings.platform_name
    }
    const iconUrl = settings.favicon_url ?? settings.logo_url
    if (iconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = iconUrl
    }
  }, [settings])

  useEffect(() => {
    if (!settings) return
    saveBrandCache({
      logo_url: settings.logo_url ?? null,
      platform_name: settings.platform_name ?? null,
      tagline: settings.tagline ?? null,
      primary_color: settings.primary_color ?? null,
      secondary_color: settings.secondary_color ?? null,
      success_color: settings.success_color ?? null,
      error_color: settings.error_color ?? null,
      background_primary_color: settings.background_primary_color ?? null,
      background_secondary_color: settings.background_secondary_color ?? null,
    })
  }, [settings])

  return null
}