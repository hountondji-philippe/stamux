import { useState } from 'react'
import { Star, CheckCircle2 } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { getApiErrorMessage } from '../../../lib/utils/api-error'
import { useSubmitFeedback } from '../hooks/use-submit-feedback'

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="outline-none">
          <Star
            size={22}
            className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
          />
        </button>
      ))}
    </div>
  )
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-slate-700 dark:text-slate-300">{label}</p>
      <StarRating value={value} onChange={onChange} />
    </div>
  )
}

export function InternshipFeedbackForm() {
  const [welcomeRating, setWelcomeRating] = useState(0)
  const [mentorshipRating, setMentorshipRating] = useState(0)
  const [atmosphereRating, setAtmosphereRating] = useState(0)
  const [professionalValueRating, setProfessionalValueRating] = useState(0)
  const [recommendationScore, setRecommendationScore] = useState(0)
  const [comment, setComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const { mutate, isPending, error, isSuccess } = useSubmitFeedback()

  const allRated =
    welcomeRating > 0 &&
    mentorshipRating > 0 &&
    atmosphereRating > 0 &&
    professionalValueRating > 0 &&
    recommendationScore > 0

  function handleSubmit() {
    mutate({
      welcome_rating: welcomeRating,
      mentorship_rating: mentorshipRating,
      atmosphere_rating: atmosphereRating,
      professional_value_rating: professionalValueRating,
      recommendation_score: recommendationScore,
      comment: comment || undefined,
      is_anonymous: isAnonymous,
    })
  }

  if (isSuccess) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-2">
          <CheckCircle2 className="text-success" size={22} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Merci pour ton retour !</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ton evaluation de fin de stage a bien ete enregistree.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <p className="mb-1 font-semibold text-slate-900 dark:text-slate-100">Evalue ton stage</p>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Ton stage est termine, prends un instant pour partager ton experience.
      </p>

      <div className="space-y-3">
        <RatingRow label="Accueil au sein de la structure" value={welcomeRating} onChange={setWelcomeRating} />
        <RatingRow label="Qualite de l'encadrement (mentor)" value={mentorshipRating} onChange={setMentorshipRating} />
        <RatingRow label="Ambiance de travail" value={atmosphereRating} onChange={setAtmosphereRating} />
        <RatingRow label="Valeur professionnelle acquise" value={professionalValueRating} onChange={setProfessionalValueRating} />
        <RatingRow label="Recommanderais-tu ce stage ?" value={recommendationScore} onChange={setRecommendationScore} />
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)"
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
        Soumettre de maniere anonyme
      </label>

      {error && <p className="mt-3 text-sm text-danger">{getApiErrorMessage(error)}</p>}

      <Button className="mt-4 w-full" disabled={isPending || !allRated} onClick={handleSubmit}>
        {isPending ? 'Envoi...' : 'Envoyer mon evaluation'}
      </Button>
    </Card>
  )
}
