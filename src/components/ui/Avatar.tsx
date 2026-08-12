interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const dimensions = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 text-xs'

  return (
    <div
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-gradient-brand font-bold text-white`}
    >
      {initials}
    </div>
  )
}