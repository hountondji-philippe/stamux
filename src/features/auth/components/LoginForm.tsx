import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/use-login'
import { usePlatformSettings } from '../../settings/hooks/use-settings'
import { readBrandCache } from '../../../lib/theme/brand-cache'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const { mutate, isPending, error } = useLogin()
  const { data: platformData } = usePlatformSettings()
  const cached = readBrandCache()

  const logoUrl = platformData?.data.logo_url ?? cached?.logo_url ?? null
  const platformName = platformData?.data.platform_name ?? cached?.platform_name ?? 'STAMUX'
  const tagline = platformData?.data.tagline ?? cached?.tagline ?? 'Internship OS'

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-brand p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg bg-white/10 object-contain p-1" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">
              {platformName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{platformName}</p>
            <p className="text-xs text-white/70">{tagline}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Suis et accompagne tes stagiaires, du premier jour a l'attestation finale.
          </h2>
          <p className="mt-4 text-sm text-white/80">
            Presences, rapports, documents et messagerie reunis dans un seul espace, pense pour les
            mentors comme pour les stagiaires.
          </p>
        </div>

        <p className="relative text-xs text-white/50">
          &copy; {new Date().getFullYear()} {platformName}. Tous droits reserves.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-12 w-12 object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                {platformName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{platformName}</p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Connexion</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Entre tes identifiants pour acceder a ton espace.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <TextInput id="email" type="email" autoComplete="email" {...register('email')} />
              </FormField>

              <FormField label="Mot de passe" htmlFor="password" error={errors.password?.message}>
                <TextInput
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                />
              </FormField>

              {error && (
                <p className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
                  Email ou mot de passe incorrect.
                </p>
              )}

              <Button type="submit" fullWidth disabled={isPending}>
                {isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}