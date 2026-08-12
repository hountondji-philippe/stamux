import type { ReactNode } from 'react'

interface Column {
  header: string
  align?: 'left' | 'right'
}

interface DataTableProps {
  columns: (string | Column)[]
  children: ReactNode
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/80 dark:bg-slate-800/50">
          <tr>
            {columns.map((col, i) => {
              const label = typeof col === 'string' ? col : col.header
              const align = typeof col === 'string' ? 'left' : col.align ?? 'left'
              return (
                <th
                  key={i}
                  className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-primary ${
                    align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
      </table>
    </div>
  )
}