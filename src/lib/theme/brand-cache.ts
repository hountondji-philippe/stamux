const CACHE_KEY = 'stamux-platform-brand'

export interface CachedBrand {
  logo_url: string | null
  platform_name: string | null
  tagline: string | null
  primary_color: string | null
  secondary_color: string | null
  success_color: string | null
  error_color: string | null
  background_primary_color: string | null
  background_secondary_color: string | null
}

export function saveBrandCache(brand: CachedBrand) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(brand))
  } catch {
    // stockage indisponible, on ignore
  }
}

export function readBrandCache(): CachedBrand | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedBrand) : null
  } catch {
    return null
  }
}

export function applyCachedBrandColors() {
  const cached = readBrandCache()
  if (!cached) return
  const root = document.documentElement.style
  if (cached.primary_color) root.setProperty('--color-primary', cached.primary_color)
  if (cached.secondary_color) root.setProperty('--color-secondary', cached.secondary_color)
  if (cached.success_color) root.setProperty('--color-success', cached.success_color)
  if (cached.error_color) root.setProperty('--color-danger', cached.error_color)
  if (cached.background_primary_color) root.setProperty('--color-surface', cached.background_primary_color)
  if (cached.background_secondary_color) root.setProperty('--color-surface-alt', cached.background_secondary_color)
  if (cached.primary_color && cached.secondary_color) {
    root.setProperty(
      '--background-image-gradient-brand',
      `linear-gradient(135deg, ${cached.primary_color} 0%, ${cached.secondary_color} 100%)`
    )
  }
}