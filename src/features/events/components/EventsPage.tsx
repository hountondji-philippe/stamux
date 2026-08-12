import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Pin, Pencil, Trash2, CalendarDays, ImagePlus, X } from 'lucide-react'
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../hooks/use-events'
import { useAuthStore } from '../../../store/auth-store'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { FormField, TextInput } from '../../../components/ui/FormField'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import type { Event, EventAudience } from '../../../types/event'

const audienceLabels: Record<EventAudience, string> = {
  all: 'Tous',
  interns: 'Stagiaires',
  mentors: 'Mentors',
}

const audienceTones = {
  all: 'neutral',
  interns: 'primary',
  mentors: 'warning',
} as const

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ImagePicker({
  currentUrl,
  file,
  onFileChange,
  onRemoveExisting,
  removingExisting,
}: {
  currentUrl: string | null
  file: File | null
  onFileChange: (file: File | null) => void
  onRemoveExisting: () => void
  removingExisting: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const displayUrl = previewUrl ?? (!removingExisting ? currentUrl : null)

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Image (optionnel)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      {displayUrl ? (
        <div className="relative">
          <img src={displayUrl} alt="" className="max-h-48 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => {
              if (file) {
                onFileChange(null)
              } else {
                onRemoveExisting()
              }
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Retirer l'image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-6 text-slate-400 hover:border-primary hover:text-primary dark:border-slate-700"
        >
          <ImagePlus size={22} />
          <span className="text-xs">Ajouter une image</span>
        </button>
      )}
    </div>
  )
}

function EventFormModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const { mutate: create, isPending: isCreating, error: createError } = useCreateEvent()
  const { mutate: update, isPending: isUpdating, error: updateError } = useUpdateEvent()
  const [title, setTitle] = useState(event?.title ?? '')
  const [content, setContent] = useState(event?.content ?? '')
  const [audience, setAudience] = useState<EventAudience>(event?.audience ?? 'all')
  const [isPinned, setIsPinned] = useState(event?.is_pinned ?? false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  const isPending = isCreating || isUpdating
  const error = createError || updateError
  const isEditing = !!event

  const handleSubmit = () => {
    if (isEditing) {
      update(
        {
          id: event.id,
          title,
          content,
          audience,
          is_pinned: isPinned,
          image: imageFile ?? undefined,
          removeImage: removeExistingImage,
        },
        { onSuccess: onClose }
      )
    } else {
      create(
        { title, content, audience, is_pinned: isPinned, image: imageFile ?? undefined },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <Modal open onClose={onClose} title={isEditing ? 'Modifier la publication' : 'Nouvelle publication'}>
      <div className="space-y-4">
        <FormField label="Titre" htmlFor="event-title">
          <TextInput id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>

        <FormField label="Contenu" htmlFor="event-content">
          <textarea
            id="event-content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </FormField>

        <ImagePicker
          currentUrl={event?.image_url ?? null}
          file={imageFile}
          onFileChange={(file) => {
            setImageFile(file)
            if (file) setRemoveExistingImage(false)
          }}
          onRemoveExisting={() => setRemoveExistingImage(true)}
          removingExisting={removeExistingImage}
        />

        <FormField label="Destinataires" htmlFor="event-audience">
          <select
            id="event-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as EventAudience)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">Tous</option>
            <option value="interns">Stagiaires uniquement</option>
            <option value="mentors">Mentors uniquement</option>
          </select>
        </FormField>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          Epingler cette publication en haut de la liste
        </label>

        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

        <Button fullWidth disabled={isPending || !title.trim() || !content.trim()} onClick={handleSubmit}>
          {isPending ? 'Enregistrement...' : isEditing ? 'Enregistrer les modifications' : 'Publier'}
        </Button>
      </div>
    </Modal>
  )
}

function DeleteConfirmModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const { mutate, isPending, error } = useDeleteEvent()

  return (
    <Modal open onClose={onClose} title="Supprimer la publication">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Cette action est definitive. Supprimer <strong>{event.title}</strong> ?
        </p>
        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={isPending}
            onClick={() => mutate(event.id, { onSuccess: onClose })}
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function EventsPage() {
  const role = useAuthStore((state) => state.user?.role)
  const isAdmin = role === 'admin'
  const { data, isLoading } = useEvents()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)

  const events = useMemo(() => {
    const list = data?.data ?? []
    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
      return dateB - dateA
    })
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evenements"
        description={isAdmin ? 'Publie et gere les annonces de la plateforme.' : 'Annonces et informations de la plateforme.'}
        action={
          isAdmin ? (
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingEvent(null)
                setFormOpen(true)
              }}
            >
              Nouvelle publication
            </Button>
          ) : undefined
        }
      />

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>}

      {!isLoading && events.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Aucune publication"
          description={isAdmin ? 'Cree ta premiere annonce pour la plateforme.' : "Il n'y a pas encore d'annonce."}
        />
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {event.is_pinned && (
                    <span className="flex items-center gap-1 text-xs font-medium text-warning">
                      <Pin size={12} fill="currentColor" />
                      Epingle
                    </span>
                  )}
                  <Badge tone={audienceTones[event.audience]}>{audienceLabels[event.audience]}</Badge>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                  {event.content}
                </p>
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt=""
                    className="mt-3 max-h-72 w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-3 text-xs text-slate-400">
                  {event.author?.name ? `${event.author.name} · ` : ''}
                  {formatDate(event.published_at ?? event.created_at)}
                </p>
              </div>

              {isAdmin && (
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      setEditingEvent(event)
                      setFormOpen(true)
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingEvent(event)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-danger/10 hover:text-danger"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {formOpen && (
        <EventFormModal
          event={editingEvent}
          onClose={() => {
            setFormOpen(false)
            setEditingEvent(null)
          }}
        />
      )}

      {deletingEvent && (
        <DeleteConfirmModal event={deletingEvent} onClose={() => setDeletingEvent(null)} />
      )}
    </div>
  )
}