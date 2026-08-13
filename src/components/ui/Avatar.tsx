import { useState } from 'react'

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, avatarUrl, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const dimensions =
    size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-8 w-8 text-xs'

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${dimensions} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gradient-brand font-bold text-white`}
    >
      {initials}
    </div>
  )
}