import type { KeywordGap } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  gaps: KeywordGap[]
}

const IMPORTANCE_CONFIG = {
  critical: { label: 'Critical', className: 'bg-danger/10 text-danger border-danger/20' },
  important: { label: 'Important', className: 'bg-warning/10 text-warning border-warning/20' },
  'nice-to-have': { label: 'Nice to Have', className: 'bg-surface-hover text-text-secondary border-border' },
} as const

function GapGroup({
  label,
  gaps,
  chipClass,
}: {
  label: string
  gaps: KeywordGap[]
  chipClass: string
}) {
  if (gaps.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {gaps.map((g) => (
          <div
            key={g.keyword}
            className={cn(
              'group relative px-3 py-1.5 rounded-full border text-xs font-medium cursor-default',
              chipClass
            )}
            title={g.context}
          >
            {g.keyword}
          </div>
        ))}
      </div>
    </div>
  )
}

export function KeywordGaps({ gaps }: Props) {
  if (!gaps || gaps.length === 0) {
    return <p className="text-sm text-text-muted">No keyword gaps detected.</p>
  }

  const critical = gaps.filter((g) => g.importance === 'critical')
  const important = gaps.filter((g) => g.importance === 'important')
  const niceToHave = gaps.filter((g) => g.importance === 'nice-to-have')

  return (
    <div className="space-y-5">
      <GapGroup label="Critical" gaps={critical} chipClass={IMPORTANCE_CONFIG.critical.className} />
      <GapGroup label="Important" gaps={important} chipClass={IMPORTANCE_CONFIG.important.className} />
      <GapGroup label="Nice to Have" gaps={niceToHave} chipClass={IMPORTANCE_CONFIG['nice-to-have'].className} />
    </div>
  )
}
