'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { getScoreLabel } from '@/lib/utils'

interface Props {
  score: number
  label?: string
  size?: number
}

export function ScoreRing({ score, label = 'Overall Score', size = 160 }: Props) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const data = [{ value: score }, { value: Math.max(0, 100 - score) }]
  const r = size / 2

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            cx={r - 4}
            cy={r - 4}
            innerRadius={r * 0.62}
            outerRadius={r * 0.8}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive
          >
            <Cell fill={color} />
            <Cell fill="#1a1a1e" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-text-muted">/ 100</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary text-center">{label}</p>
      <p className="text-xs font-semibold text-center" style={{ color }}>
        {getScoreLabel(score)}
      </p>
    </div>
  )
}
