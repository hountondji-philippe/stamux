import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProject } from '../hooks/use-projects'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'

const schema = z
  .object({
    title: z.string().min(1, 'Le titre est requis').max(255),
    description: z.string().min(1, 'La description est requise').max(5000),
    objectives: z.string().max(2000).optional(),
    deliverables: z.string().max(2000).optional(),
    start_date: z.string().min(1, 'La date de debut est requise'),
    end_date: z.string().optional(),
  })
  .refine((data) => !data.end_date || data.end_date > data.start_date, {
    message: 'La date de fin doit etre apres la date de debut',
    path: ['end_date'],
  })

type FormData = z.infer<typeof schema>

export function CreateProjectForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate, isPending, error } = useCreateProject()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    mutate(data, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Titre du projet" htmlFor="title" error={errors.title?.message}>
        <TextInput id="title" type="text" {...register('title')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          {...register('description')}
        />
      </FormField>

      <FormField label="Objectifs (optionnel)" htmlFor="objectives">
        <textarea
          id="objectives"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          {...register('objectives')}
        />
      </FormField>

      <FormField label="Livrables attendus (optionnel)" htmlFor="deliverables">
        <textarea
          id="deliverables"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          {...register('deliverables')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date de debut" htmlFor="start_date" error={errors.start_date?.message}>
          <TextInput id="start_date" type="date" {...register('start_date')} />
        </FormField>
        <FormField label="Date de fin (optionnel)" htmlFor="end_date" error={errors.end_date?.message}>
          <TextInput id="end_date" type="date" {...register('end_date')} />
        </FormField>
      </div>

      {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? 'Creation...' : 'Creer le projet'}
      </Button>
    </form>
  )
}