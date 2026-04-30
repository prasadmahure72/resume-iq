'use client'

import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGES: Record<string, { label: string; description: string }> = {
  reading: {
    label: 'Reading your resume',
    description: 'Extracting key information from your document',
  },
  analyzing: {
    label: 'Analyzing your resume',
    description: 'We are reviewing your resume against the job description',
  },
  retrying: {
    label: 'Refining analysis',
    description: 'Polishing the results for accuracy',
  },
  saving: {
    label: 'Saving results',
    description: 'Storing your analysis securely',
  },
  done: {
    label: 'Analysis complete',
    description: 'Redirecting to your results…',
  },
}

const STAGE_KEYS = ['reading', 'analyzing', 'saving']

interface Props {
  stage: string
  progress: number
}

export function StreamingIndicator({ stage, progress }: Props) {
  const current = STAGES[stage] ?? {
    label: 'Analyzing…',
    description: 'Please wait while we process your resume',
  }
  const isDone = stage === 'done'
  const currentIdx = STAGE_KEYS.indexOf(stage === 'retrying' ? 'analyzing' : stage)

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-6 rounded-2xl border border-accent/20 bg-accent/5">
      {/* Icon */}
      <div className="relative">
        {isDone ? (
          <CheckCircle2 className="w-12 h-12 text-accent" />
        ) : (
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
        )}
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl -z-10" />
      </div>

      {/* Label */}
      <div className="text-center space-y-1.5">
        <p className="text-sm font-semibold text-text-primary">{current.label}</p>
        <p className="text-xs text-text-muted">{current.description}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs space-y-1.5">
        <div className="flex justify-between text-xs text-text-muted">
          <span>Progress</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage dots */}
      <div className="flex items-center gap-2">
        {STAGE_KEYS.map((s, idx) => (
          <div
            key={s}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              idx < currentIdx
                ? 'w-6 bg-accent'
                : idx === currentIdx
                  ? 'w-8 bg-accent'
                  : 'w-4 bg-surface-hover'
            )}
          />
        ))}
      </div>
    </div>
  )
}
