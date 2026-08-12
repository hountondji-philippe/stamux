import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />
  )
}