import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useInvitationCheck, useAcceptInvitation } from '../hooks/use-invitation'
import { roleLabels } from '../../../lib/utils/role-labels'

const acceptSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Au moins 8 caracteres')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  })

type AcceptFormData = z.infer<typeof acceptSchema>

export function AcceptInvitationForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const { data, isLoading, isError } = useInvitationCheck(token)
  const { mutate, isPending, error } = useAcceptInvitation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
  })

  const onSubmit = (formData: AcceptFormData) => {
    if (!token) return
    mutate(
      { token, ...formData },
      {
        onSuccess: () => navigate('/login'),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Verification du lien...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800/50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Lien invalide</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ce lien d'invitation est invalide ou a expire. Demande a ton administrateur de te
            renvoyer une invitation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Bienvenue sur STAMUX</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {data.data.name} · {roleLabels[data.data.role as keyof typeof roleLabels]}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{data.data.email}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Choisis un mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Confirme le mot de passe
            </label>
            <input
              id="password_confirmation"
              type="password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
              {...register('password_confirmation')}
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-danger">{errors.password_confirmation.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-danger">
              Impossible d'activer le compte. Le lien a peut-etre deja ete utilise.
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {isPending ? 'Activation...' : 'Activer mon compte'}
          </button>
        </form>
      </div>
    </div>
  )
}