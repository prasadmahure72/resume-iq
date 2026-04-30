import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FileText,
  ScanText,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Building2,
  Briefcase,
  CalendarDays,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DeleteButton } from '@/components/history/DeleteButton'
import { formatDate, cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'History' }

const LIMIT = 10

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums shrink-0',
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

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled?: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-text-muted opacity-40 cursor-not-allowed">
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
    >
      {children}
    </Link>
  )
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? 1))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const from = (page - 1) * LIMIT
  const to = from + LIMIT - 1

  const { data, count } = await supabase
    .from('analyses')
    .select(
      'id, resume_filename, job_title, company_name, overall_score, created_at',
      { count: 'exact' }
    )
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .range(from, to)

  const rows = data ?? []
  const total = count ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Analysis History</h1>
          <p className="text-text-secondary text-sm mt-1">
            {total > 0 ? `${total} ${total === 1 ? 'analysis' : 'analyses'} found` : 'No analyses yet'}
          </p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-lg transition-colors"
        >
          <ScanText className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* Empty state */}
      {rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-16 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-text-primary font-semibold">No analyses yet</p>
            <p className="text-text-secondary text-sm mt-1">
              Upload your first resume to get started.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background text-sm font-semibold rounded-xl transition-colors"
          >
            <ScanText className="w-4 h-4" /> Analyze a Resume
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-border">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Resume
              </span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Score
              </span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Date
              </span>
              <span className="sr-only">Actions</span>
            </div>

            <div className="divide-y divide-border">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-surface-hover transition-colors group"
                >
                  {/* File info */}
                  <Link href={`/results/${row.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {row.resume_filename}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {row.job_title && (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Briefcase className="w-3 h-3" />
                            {row.job_title}
                          </span>
                        )}
                        {row.company_name && (
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Building2 className="w-3 h-3" />
                            {row.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Score */}
                  <div className="shrink-0">
                    <ScoreBadge score={row.overall_score} />
                  </div>

                  {/* Date */}
                  <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted shrink-0">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(row.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/results/${row.id}`}
                      className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                      aria-label="View results"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={row.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <PaginationLink
                  href={`/history?page=${page - 1}`}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </PaginationLink>
                <PaginationLink
                  href={`/history?page=${page + 1}`}
                  disabled={page >= totalPages}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </PaginationLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
