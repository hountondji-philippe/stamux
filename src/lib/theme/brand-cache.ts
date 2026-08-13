const CACHE_KEY = 'stamux-platform-brand'

export interface CachedBrand {
  logo_url: string | null
  platform_name: string | null
  tagline: string | null
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