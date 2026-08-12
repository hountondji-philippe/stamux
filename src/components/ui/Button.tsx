import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  danger: 'bg-white text-danger border border-danger/30 hover:bg-danger-light',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
}

export function Button({
  variant = 'primary',
  icon,
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        variantStyles[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}