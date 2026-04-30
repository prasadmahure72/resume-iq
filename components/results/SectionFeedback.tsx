'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import type { SectionFeedback as SectionFeedbackType } from '@/types'
import { cn, getScoreColor } from '@/lib/utils'

interface Props {
  sections: SectionFeedbackType[]
}

function SectionItem({ section }: { section: SectionFeedbackType }) {
  const [open, setOpen] = useState(false)
  const color = getScoreColor(section.score)

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-hover transition-colors"
      >
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold text-text-primary capitalize">
            {section.name}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn('text-sm font-bold tabular-nums', color)}>
            {section.score}
            <span className="text-text-muted font-normal text-xs">/100</span>
          </span>
          <div
            className="h-1.5 w-16 bg-surface-hover rounded-full overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${section.score}%`,
                backgroundColor:
                  section.score >= 80
                    ? '#10b981'
                    : section.score >= 60
                      ? '#f59e0b'
                      : '#ef4444',
              }}
            />
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-text-muted transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 py-4 border-t border-border space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">{section.feedback}</p>
          {section.improvements && section.improvements.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Improvements
              </p>
              <ul className="space-y-1.5">
                {section.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SectionFeedback({ sections }: Props) {
  if (!sections || sections.length === 0) {
    return <p className="text-sm text-text-muted">No section feedback available.</p>
  }
  return (
    <div className="space-y-2">
      {sections.map((s) => (
        <SectionItem key={s.name} section={s} />
      ))}
    </div>
  )
}
