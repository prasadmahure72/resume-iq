import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowLeft,
  FileText,
  CalendarDays,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  ScanText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ScoreRing } from '@/components/results/ScoreRing'
import { SectionFeedback } from '@/components/results/SectionFeedback'
import { KeywordGaps } from '@/components/results/KeywordGaps'
import { SuggestionsPanel } from '@/components/results/SuggestionsPanel'
import { formatDate, cn } from '@/lib/utils'
import type { AnalysisResult } from '@/types'

export const metadata: Metadata = { title: 'Analysis Results' }

function SectionCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  )
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!analysis) notFound()

  if (analysis.status === 'failed') {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col items-center gap-4 text-center">
        <XCircle className="w-12 h-12 text-danger" />
        <h1 className="text-xl font-semibold text-text-primary">Analysis Failed</h1>
        <p className="text-text-secondary text-sm">
          Something went wrong while analyzing this resume.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-lg transition-colors"
        >
          <ScanText className="w-4 h-4" /> Try Again
        </Link>
      </div>
    )
  }

  const result = analysis.result as AnalysisResult

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to history
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-text-primary truncate">
              {analysis.resume_filename}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {analysis.job_title && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Briefcase className="w-3.5 h-3.5" />
                  {analysis.job_title}
                </span>
              )}
              {analysis.company_name && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Building2 className="w-3.5 h-3.5" />
                  {analysis.company_name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatDate(analysis.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score overview */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Score rings */}
          <div className="flex items-center gap-8 shrink-0">
            <ScoreRing score={result.overall_score} label="Overall Score" size={160} />
            <div className="w-px h-24 bg-border hidden sm:block" />
            <ScoreRing score={result.ats_score} label="ATS Score" size={120} />
          </div>

          {/* Verdict */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Verdict
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">{result.verdict}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Issues */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-success/20 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-success uppercase tracking-wider">
            Strengths
          </p>
          <ul className="space-y-2">
            {result.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface border border-danger/20 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-danger uppercase tracking-wider">
            Critical Issues
          </p>
          <ul className="space-y-2">
            {result.critical_issues?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section feedback */}
      <SectionCard title="Section Feedback">
        <SectionFeedback sections={result.sections ?? []} />
      </SectionCard>

      {/* Keyword gaps */}
      <SectionCard title="Missing Keywords">
        <p className="text-xs text-text-muted -mt-2 mb-1">
          Keywords from the job description not found in your resume. Hover a chip to see context.
        </p>
        <KeywordGaps gaps={result.keyword_gaps ?? []} />
      </SectionCard>

      {/* Suggestions */}
      <SectionCard title="Improvement Suggestions">
        <SuggestionsPanel suggestions={result.suggestions ?? []} />
      </SectionCard>

      {/* Rewrite examples */}
      {result.rewrite_examples && result.rewrite_examples.length > 0 && (
        <SectionCard title="Rewrite Examples">
          <div className="space-y-4">
            {result.rewrite_examples.map((ex, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-border bg-surface-hover">
                  <span className="text-xs font-semibold text-text-muted capitalize">
                    {ex.section}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                  <div className="p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-danger uppercase tracking-wider">
                      Before
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">{ex.original}</p>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-success uppercase tracking-wider">
                      After
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">{ex.improved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Analyze again CTA */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-text-primary">Want a better score?</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Apply the suggestions above, update your resume, and run a new analysis.
          </p>
        </div>
        <Link
          href="/analyze"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-lg transition-colors"
        >
          <ScanText className="w-4 h-4" /> Analyze Again
        </Link>
      </div>
    </div>
  )
}
