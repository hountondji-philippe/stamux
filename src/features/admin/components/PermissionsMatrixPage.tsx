import { useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { useRolePermissions, useUpdateRolePermission, type RolePermissionRow } from '../hooks/use-role-permissions'

const roleOrder: RolePermissionRow['role'][] = ['admin', 'mentor', 'intern']

const roleLabels: Record<RolePermissionRow['role'], string> = {
  admin: 'Admin',
  mentor: 'Mentor',
  intern: 'Stagiaire',
}

const permissionOrder = [
  'gerer_utilisateurs',
  'voir_statistiques',
  'traiter_documents_admin',
  'corriger_presences',
  'publier_evenements',
  'valider_documents_mentor',
  'valider_rapports',
  'valider_permissions',
  'deposer_rapport',
  'soumettre_permission',
  'voir_stagiaires',
  'messagerie_interne',
]

interface GroupedPermission {
  key: string
  label: string
  description: string | null
  isDynamic: boolean
  byRole: Partial<Record<RolePermissionRow['role'], RolePermissionRow>>
}

function groupByPermission(rows: RolePermissionRow[]): GroupedPermission[] {
  const map = new Map<string, GroupedPermission>()

  for (const row of rows) {
    if (!map.has(row.permission_key)) {
      map.set(row.permission_key, {
        key: row.permission_key,
        label: row.label,
        description: row.description,
        isDynamic: row.is_dynamic,
        byRole: {},
      })
    }
    map.get(row.permission_key)!.byRole[row.role] = row
  }

  const grouped = Array.from(map.values())

  grouped.sort((a, b) => {
    const ia = permissionOrder.indexOf(a.key)
    const ib = permissionOrder.indexOf(b.key)
    if (ia === -1 && ib === -1) return a.key.localeCompare(b.key)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return grouped
}

function Toggle({
  checked,
  disabled,
  loading,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  loading?: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled || loading}
      onClick={onChange}
      style={{ backgroundColor: checked ? '#16a34a' : '#cbd5e1' }}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-0 p-0 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform"
      />
    </button>
  )
}

export function PermissionsMatrixPage() {
  const { data, isLoading, error } = useRolePermissions()
  const { mutate, isPending } = useUpdateRolePermission()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const rows = data?.data ?? []
  const grouped = groupByPermission(rows)

  const handleToggle = (row: RolePermissionRow) => {
    setErrorMessage(null)
    setPendingId(row.id)
    mutate(
      { id: row.id, enabled: !row.enabled },
      {
        onError: (err) => setErrorMessage(getApiErrorMessage(err)),
        onSettled: () => setPendingId(null),
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="Gere les droits d'acces par role sur la plateforme." />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}
      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
      {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}

      {!isLoading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Permission
                  </th>
                  {roleOrder.map((role) => (
                    <th
                      key={role}
                      className="pb-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {roleLabels[role]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grouped.map((perm) => (
                  <tr key={perm.key}>
                    <td className="py-4 pr-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{perm.label}</p>
                      {perm.description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{perm.description}</p>
                      )}
                      {!perm.isDynamic && (
                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Pas encore connecte au backend
                        </span>
                      )}
                    </td>
                    {roleOrder.map((role) => {
                      const cell = perm.byRole[role]
                      if (!cell) {
                        return (
                          <td key={role} className="py-4 text-center text-slate-300">
                            —
                          </td>
                        )
                      }
                      const isSelfLockGuard = role === 'admin' && perm.key === 'gerer_utilisateurs' && cell.enabled
                      return (
                        <td key={role} className="py-4">
                          <div className="flex justify-center">
                            <Toggle
                              checked={cell.enabled}
                              disabled={isSelfLockGuard || (isPending && pendingId === cell.id)}
                              loading={isPending && pendingId === cell.id}
                              onChange={() => handleToggle(cell)}
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}