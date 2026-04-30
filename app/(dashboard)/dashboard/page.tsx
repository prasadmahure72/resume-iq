import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  BarChart3,
  TrendingUp,
  Trophy,
  CalendarDays,
  ScanText,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { formatDate, getScoreColor, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats(userId: string) {
  const supabase = await createClient()
  try {
    const { data } = await supabase
      .from('analyses')
      .select('id, overall_score, resume_filename, job_title, company_name, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    const all = data ?? []
    const scores = all.map((a) => a.overall_score)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return {
      recent: all.slice(0, 5),
      total: all.length,
      avg: scores.length
        ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)
        : null,
      best: scores.length ? Math.max(...scores) : null,
      thisWeek: all.filter((a) => new Date(a.created_at) > weekAgo).length,
    }
  } catch {
    return { recent: [], total: 0, avg: null, best: null, thisWeek: 0 }
  }
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums',
        score >= 80
          ? 'bg-success/10 text-success'
          : score >= 60
            ? 'bg-warning/10 text-warning'
            : 'bg-danger/10 text-danger'
      )}
    >
      {score}
    </span>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center',
          accent ? 'bg-accent/15' : 'bg-surface-hover'
        )}
      >
        <Icon
          className={cn('w-4.5 h-4.5', accent ? 'text-accent' : 'text-text-secondary')}
        />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary tabular-nums">{value}</p>
        <p className="text-sm text-text-secondary mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const stats = await getStats(user.id)
  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there'

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Good to see you, {firstName} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Here&apos;s a snapshot of your resume performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Analyses"
          value={stats.total}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={stats.avg !== null ? stats.avg : '—'}
          sub={stats.avg !== null ? undefined : 'No data yet'}
        />
        <StatCard
          icon={Trophy}
          label="Best Score"
          value={stats.best !== null ? stats.best : '—'}
        />
        <StatCard
          icon={CalendarDays}
          label="This Week"
          value={stats.thisWeek}
          sub="analyses"
        />
      </div>

      {/* Recent analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Recent Analyses
          </h2>
          {stats.total > 0 && (
            <Link
              href="/history"
              className="text-sm text-accent hover:text-accent-hover font-medium transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {stats.recent.length === 0 ? (
          /* Empty state */
          <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-text-primary font-medium">No analyses yet</p>
              <p className="text-text-secondary text-sm mt-1">
                Upload your first resume and get instant AI feedback.
              </p>
            </div>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-lg transition-colors"
            >
              <ScanText className="w-4 h-4" />
              Analyze a Resume
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
            {stats.recent.map((a) => (
              <Link
                key={a.id}
                href={`/results/${a.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {a.resume_filename}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {a.job_title
                      ? `${a.job_title}${a.company_name ? ` · ${a.company_name}` : ''}`
                      : 'No job title'}
                    {' · '}
                    {formatDate(a.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ScoreBadge score={a.overall_score} />
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA card */}
      {stats.total > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text-primary">
              Ready for another analysis?
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              Upload a new resume or try a different job description.
            </p>
          </div>
          <Link
            href="/analyze"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-lg transition-colors"
          >
            <ScanText className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      )}
    </div>
  )
}
