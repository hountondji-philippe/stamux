import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { useAssignMentor } from '../hooks/use-assign-mentor'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import type { User } from '../../../types/user'

interface AssignMentorModalProps {
  open: boolean
  onClose: () => void
  intern: User | null
  mentors: User[]
}

export function AssignMentorModal({ open, onClose, intern, mentors }: AssignMentorModalProps) {
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const { mutate, isPending, error } = useAssignMentor()

  if (!intern) return null

  const handleAssign = () => {
    if (!selectedMentorId) return
    mutate(
      { internId: intern.id, mentorId: selectedMentorId },
      {
        onSuccess: () => {
          setSelectedMentorId('')
          onClose()
        },
      }
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={`Assigner un mentor a ${intern.name}`}>
      <div className="space-y-4">
        {mentors.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucun mentor disponible. Cree d'abord un compte mentor.
          </p>
        ) : (
          <select
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Choisir un mentor</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}

        {error && <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>}

        <button
          onClick={handleAssign}
          disabled={!selectedMentorId || isPending}
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {isPending ? 'Assignation...' : 'Assigner'}
        </button>
      </div>
    </Modal>
  )
}