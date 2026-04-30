import type { Suggestion } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  suggestions: Suggestion[]
}

const PRIORITY = { high: 0, medium: 1, low: 2 } as const

const PRIORITY_CONFIG = {
  high: { label: 'High', className: 'bg-danger/10 text-danger' },
  medium: { label: 'Medium', className: 'bg-warning/10 text-warning' },
  low: { label: 'Low', className: 'bg-surface-hover text-text-muted' },
} as const

export function SuggestionsPanel({ suggestions }: Props) {
  if (!suggestions || suggestions.length === 0) {
    return <p className="text-sm text-text-muted">No suggestions available.</p>
  }

  const sorted = [...suggestions].sort(
    (a, b) => PRIORITY[a.priority] - PRIORITY[b.priority]
  )

  return (
    <div className="space-y-3">
      {sorted.map((s, i) => {
        const cfg = PRIORITY_CONFIG[s.priority]
        return (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4 space-y-1.5"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-md',
                  cfg.className
                )}
              >
                {cfg.label}
              </span>
              <span className="text-xs text-text-muted bg-surface-hover px-2 py-0.5 rounded-md">
                {s.category}
              </span>
            </div>
            <p className="text-sm font-medium text-text-primary">{s.action}</p>
            <p className="text-xs text-text-secondary">{s.reason}</p>
          </div>
        )
      })}
    </div>
  )
}
