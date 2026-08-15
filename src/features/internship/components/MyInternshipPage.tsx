import { useState } from 'react'
import { CalendarClock, Star } from 'lucide-react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { InternshipDateChangeForm } from '../../internship-date-change/components/InternshipDateChangeForm'
import { InternshipFeedbackForm } from '../../feedback/components/InternshipFeedbackForm'

type Tab = 'dates' | 'feedback'

export function MyInternshipPage() {
  const [tab, setTab] = useState<Tab>('dates')

  const tabs: { id: Tab; label: string; icon: typeof CalendarClock }[] = [
    { id: 'dates', label: 'Modifier les dates', icon: CalendarClock },
    { id: 'feedback', label: 'Evaluer mon stage', icon: Star },
  ]

  return (
    <div className="space-y-5">
      <PageHeader title="Mon stage" description="Gere les dates de ton stage et partage ton experience." />

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dates' && <InternshipDateChangeForm />}
      {tab === 'feedback' && <InternshipFeedbackForm />}
    </div>
  )
}