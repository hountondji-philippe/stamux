import { useState, useCallback } from 'react'

interface Coords {
  latitude: number
  longitude: number
}

interface UseGeolocationResult {
  getPosition: () => Promise<Coords>
  isLocating: boolean
  error: string | null
}

export function useGeolocation(): UseGeolocationResult {
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPosition = useCallback((): Promise<Coords> => {
    setIsLocating(true)
    setError(null)

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = 'La geolocalisation n\'est pas disponible sur cet appareil.'
        setError(message)
        setIsLocating(false)
        reject(new Error(message))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (err) => {
          setIsLocating(false)
          const message =
            err.code === err.PERMISSION_DENIED
              ? 'Autorisation de localisation refusee. Active-la dans les parametres de ton navigateur.'
              : 'Impossible de recuperer ta position. Reessaie.'
          setError(message)
          reject(new Error(message))
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }, [])

  return { getPosition, isLocating, error }
}