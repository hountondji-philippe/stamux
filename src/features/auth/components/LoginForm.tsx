import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/use-login'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onSuccess: () => navigate('/'),
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-800/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">
          Connexion à STAMUX
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-slate-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-slate-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">Email ou mot de passe incorrect.</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}