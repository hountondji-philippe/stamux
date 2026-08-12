import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateUser } from '../hooks/use-create-user'
import { getApiErrorMessage } from '../../../lib/utils/api-error'

const createUserSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis').max(255),
    email: z.string().email('Adresse email invalide'),
    role: z.enum(['mentor', 'intern']),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    mentor_id: z.string().optional(),
  })
  .refine(
    (data) => data.role !== 'intern' || !!data.start_date,
    { message: 'La date de debut est requise pour un stagiaire', path: ['start_date'] }
  )
  .refine(
    (data) => data.role !== 'intern' || !!data.end_date,
    { message: 'La date de fin est requise pour un stagiaire', path: ['end_date'] }
  )
  .refine(
    (data) =>
      !data.start_date || !data.end_date || new Date(data.end_date) > new Date(data.start_date),
    { message: 'La date de fin doit etre apres la date de debut', path: ['end_date'] }
  )

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserFormProps {
  onSuccess?: () => void
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { mutate, isPending, error } = useCreateUser()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'intern' },
  })

  const role = watch('role')

  const onSubmit = (data: CreateUserFormData) => {
    const payload = data.role === 'intern' ? data : { name: data.name, email: data.email, role: data.role }
    mutate(payload, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nom complet
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
          {...register('name')}
        />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Role
        </label>
        <select
          id="role"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
          {...register('role')}
        >
          <option value="intern">Stagiaire</option>
          <option value="mentor">Mentor</option>
        </select>
      </div>

      {role === 'intern' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date de debut
            </label>
            <input
              id="start_date"
              type="date"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
              {...register('start_date')}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-danger">{errors.start_date.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="end_date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date de fin
            </label>
            <input
              id="end_date"
              type="date"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
              {...register('end_date')}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-danger">{errors.end_date.message}</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {isPending ? 'Creation...' : 'Creer le compte et envoyer l\'invitation'}
      </button>
    </form>
  )
}