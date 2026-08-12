import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Plus, X, Paperclip, Mic, Square, FileText, Download, Play, Pause } from 'lucide-react'
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkRead,
  useStartConversation,
  type Message,
} from '../hooks/use-messaging'
import { useDirectory } from '../hooks/use-directory'
import { useAuthStore } from '../../../store/auth-store'
import { Avatar } from '../../../components/ui/Avatar'
import { roleLabels } from '../../../lib/utils/role-labels'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function NewMessageModal({ onClose, onStarted }: { onClose: () => void; onStarted: (conversationId: number) => void }) {
  const { data } = useDirectory()
  const { mutate, isPending } = useStartConversation()
  const [search, setSearch] = useState('')

  const users = (data?.data ?? []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Nouveau message</p>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <input
          autoFocus
          placeholder="Rechercher une personne..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u.id}
              disabled={isPending}
              onClick={() =>
                mutate(u.id, {
                  onSuccess: (res) => {
                    onStarted(res.data.id)
                    onClose()
                  },
                })
              }
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Avatar name={u.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[u.role] ?? u.role}</p>
              </div>
            </button>
          ))}
          {users.length === 0 && (
            <p className="p-2 text-sm text-slate-400">Aucun resultat.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function VoiceNotePlayer({ src, isMine }: { src: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const fixDuration = () => {
      // Bug connu Chrome: les blobs MediaRecorder (webm) n'ont pas de duree
      // dans leurs metadonnees -> audio.duration vaut Infinity. On force un
      // seek loin puis un retour a 0 pour obliger le navigateur a calculer
      // la vraie duree.
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        audio.currentTime = 1e101
        const onTimeUpdateOnce = () => {
          audio.removeEventListener('timeupdate', onTimeUpdateOnce)
          setDuration(audio.duration)
          audio.currentTime = 0
        }
        audio.addEventListener('timeupdate', onTimeUpdateOnce)
      } else {
        setDuration(audio.duration || 0)
      }
    }

    const onTime = () => setProgress(audio.currentTime)
    const onEnd = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', fixDuration)
    audio.addEventListener('durationchange', fixDuration)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', fixDuration)
      audio.removeEventListener('durationchange', fixDuration)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const value = Number(e.target.value)
    if (audio) audio.currentTime = value
    setProgress(value)
  }

  const trackColor = isMine ? 'accent-white' : 'accent-primary'
  const buttonColor = isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/10 hover:bg-primary/20 text-primary'

  return (
    <div className="flex min-w-[200px] items-center gap-2">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        onClick={toggle}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${buttonColor}`}
        aria-label={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={progress}
        onChange={seek}
        className={`h-1 flex-1 cursor-pointer ${trackColor}`}
      />
      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums">
        {formatDuration(isPlaying || progress > 0 ? progress : duration)}
      </span>
    </div>
  )
}

function AttachmentBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  if (!message.attachment_url) return null

  if (message.attachment_type === 'image') {
    return (
      <img
        src={message.attachment_url}
        alt={message.attachment_name ?? 'image'}
        className="max-h-64 w-full rounded-xl object-cover"
      />
    )
  }
  if (message.attachment_type === 'video') {
    return <video src={message.attachment_url} controls className="max-h-64 w-full rounded-xl" />
  }
  if (message.attachment_type === 'audio') {
    return <VoiceNotePlayer src={message.attachment_url} isMine={isMine} />
  }
  return (
    <a
      href={message.attachment_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-lg bg-white/10 p-2 text-sm underline"
    >
      <FileText size={16} />
      {message.attachment_name ?? 'Fichier'}
      <Download size={14} />
    </a>
  )
}

function AttachmentPreview({ file, isVoiceNote, onRemove }: { file: File; isVoiceNote: boolean; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])

  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
      {isVoiceNote ? (
        <Mic size={20} className="text-slate-500" />
      ) : file.type.startsWith('image/') ? (
        <img src={url} alt={file.name} className="h-10 w-10 rounded object-cover" />
      ) : (
        <FileText size={20} className="text-slate-500" />
      )}
      <span className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
        {isVoiceNote ? 'Message vocal' : file.name}
      </span>
      <button onClick={onRemove} className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
        <X size={14} />
      </button>
    </div>
  )
}

export function MessagingPage() {
  const currentUser = useAuthStore((state) => state.user)
  const { data: convData, isLoading } = useConversations()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingIsVoiceNote, setPendingIsVoiceNote] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const conversations = convData?.data ?? []

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId])

  const { data: msgData } = useMessages(activeId)
  const { mutate: send, isPending: isSending } = useSendMessage()
  const { mutate: markRead } = useMarkRead()

  const messages = msgData?.data ?? []
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  )

  useEffect(() => {
    if (activeId && activeConversation && activeConversation.unread_count > 0) {
      markRead(activeId)
    }
  }, [activeId, activeConversation, markRead])

  const handleSend = () => {
    if (!activeId || (!draft.trim() && !pendingFile)) return
    send(
      {
        conversationId: activeId,
        body: draft.trim() || undefined,
        attachment: pendingFile ?? undefined,
        isVoiceNote: pendingIsVoiceNote,
      },
      {
        onSuccess: () => {
          setDraft('')
          setPendingFile(null)
          setPendingIsVoiceNote(false)
        },
      }
    )
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `vocal-${Date.now()}.webm`, { type: 'audio/webm' })
        setPendingFile(file)
        setPendingIsVoiceNote(true)
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      alert("Impossible d'acceder au microphone. Verifie les autorisations du navigateur.")
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex w-72 shrink-0 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
        <div className="flex items-center justify-between border-b border-slate-100 p-3 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Messages</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
            aria-label="Nouveau message"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && <p className="p-4 text-sm text-slate-400">Chargement...</p>}
          {!isLoading && conversations.length === 0 && (
            <p className="p-4 text-sm text-slate-400">Aucune conversation pour l'instant.</p>
          )}
          {conversations.map((c) => {
            const other = c.participants[0]
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left dark:border-slate-800/50 ${
                  isActive ? 'bg-primary-light/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Avatar name={other?.name ?? '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{other?.name ?? 'Utilisateur'}</p>
                    {c.last_message && (
                      <span className="shrink-0 text-[11px] text-slate-400">{formatTime(c.last_message.created_at)}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {c.last_message?.body ?? (c.last_message?.attachment_url ? 'Piece jointe' : 'Nouvelle conversation')}
                  </p>
                </div>
                {c.unread_count > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
                    {c.unread_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
        {!activeConversation && (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Selectionne une conversation ou demarre-en une nouvelle.
          </div>
        )}

        {activeConversation && (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <Avatar name={activeConversation.participants[0]?.name ?? '?'} size="sm" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeConversation.participants[0]?.name ?? 'Utilisateur'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {roleLabels[activeConversation.participants[0]?.role ?? ''] ?? ''}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const isMine = m.sender_id === currentUser?.id || m.sender_id === '__optimistic__'
                const isMediaOnly = (m.attachment_type === 'image' || m.attachment_type === 'video') && !m.body
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs overflow-hidden rounded-2xl text-sm ${isMediaOnly ? '' : 'px-4 py-2'} ${
                        isMine
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {m.attachment_url && (
                        <div className={isMediaOnly ? '' : 'mb-1'}>
                          <AttachmentBubble message={m} isMine={isMine} />
                        </div>
                      )}
                      {m.body && <p className={isMediaOnly ? '' : ''}>{m.body}</p>}
                      <p
                        className={`mt-1 text-[10px] ${isMine ? 'text-white/70' : 'text-slate-400'} ${
                          isMediaOnly ? 'px-2 pb-1' : ''
                        }`}
                      >
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && (
                <p className="text-center text-sm text-slate-400">Aucun message. Dis bonjour !</p>
              )}
            </div>

            <div className="border-t border-slate-100 p-3 dark:border-slate-800">
              {pendingFile && (
                <AttachmentPreview
                  file={pendingFile}
                  isVoiceNote={pendingIsVoiceNote}
                  onRemove={() => {
                    setPendingFile(null)
                    setPendingIsVoiceNote(false)
                  }}
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setPendingFile(file)
                      setPendingIsVoiceNote(false)
                    }
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Joindre un fichier"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isRecording
                      ? 'bg-danger text-white animate-pulse'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                  aria-label={isRecording ? "Arreter l'enregistrement" : 'Message vocal'}
                >
                  {isRecording ? <Square size={16} /> : <Mic size={18} />}
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={isRecording ? 'Enregistrement en cours...' : 'Ecris un message...'}
                  disabled={isRecording}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || isRecording || (!draft.trim() && !pendingFile)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <NewMessageModal onClose={() => setModalOpen(false)} onStarted={(id) => setActiveId(id)} />
      )}
    </div>
  )
}