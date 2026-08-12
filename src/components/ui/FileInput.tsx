import { Upload } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes } from 'react'

export const FileInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function FileInput(props, ref) {
    return (
      <label
        htmlFor={props.id}
        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-center transition-colors hover:border-primary hover:bg-primary-light/30 dark:border-slate-700 dark:bg-slate-800/50"
      >
        <Upload size={18} className="text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Clique pour choisir un fichier</span>
        <input ref={ref} {...props} type="file" className="hidden" />
      </label>
    )
  }
)