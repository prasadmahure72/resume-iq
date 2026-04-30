'use client'

import { useAnalysisStore } from '@/store/analysisStore'
import { ResumeUploader } from '@/components/analyze/ResumeUploader'
import { StreamingIndicator } from '@/components/results/StreamingIndicator'
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis'
import { ScanText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const JD_MIN = 100

export default function AnalyzePage() {
  const {
    uploadedFile,
    jobTitle,
    companyName,
    jobDescription,
    isAnalyzing,
    setJobTitle,
    setCompanyName,
    setJobDescription,
  } = useAnalysisStore()

  const { isStreaming, stage, progress, error, startAnalysis } = useStreamingAnalysis()

  const canAnalyze =
    Boolean(uploadedFile) &&
    jobDescription.trim().length >= JD_MIN &&
    !isAnalyzing &&
    !isStreaming

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Analyze a Resume</h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload your PDF and paste the job description to get instant AI feedback.
        </p>
      </div>

      {/* Step 1 — Upload */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center shrink-0">
            1
          </span>
          <h2 className="text-sm font-semibold text-text-primary">Upload your resume</h2>
        </div>
        <ResumeUploader />
      </section>

      {/* Step 2 — Job details */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors',
              uploadedFile ? 'bg-accent text-background' : 'bg-surface-hover text-text-muted'
            )}
          >
            2
          </span>
          <h2
            className={cn(
              'text-sm font-semibold transition-colors',
              uploadedFile ? 'text-text-primary' : 'text-text-muted'
            )}
          >
            Add job details
          </h2>
        </div>

        <div
          className={cn(
            'space-y-3 transition-opacity duration-200',
            !uploadedFile && 'opacity-40 pointer-events-none'
          )}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="jobTitle"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Job title{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Senior Engineer"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                Company{' '}
                <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input
                id="company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-text-primary placeholder:text-text-muted bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="jd" className="text-xs font-medium text-text-secondary">
                Job description <span className="text-danger">*</span>
              </label>
              <span
                className={cn(
                  'text-xs tabular-nums transition-colors',
                  jobDescription.length < JD_MIN ? 'text-text-muted' : 'text-success'
                )}
              >
                {jobDescription.length} / {JD_MIN} min
              </span>
            </div>
            <textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here…&#10;&#10;Tip: Copy directly from LinkedIn, Greenhouse, or any job board."
              className="w-full px-3.5 py-3 rounded-lg text-sm text-text-primary placeholder:text-text-muted bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* Step 3 — Analyze */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors',
              canAnalyze || isStreaming
                ? 'bg-accent text-background'
                : 'bg-surface-hover text-text-muted'
            )}
          >
            3
          </span>
          <h2
            className={cn(
              'text-sm font-semibold transition-colors',
              canAnalyze || isStreaming ? 'text-text-primary' : 'text-text-muted'
            )}
          >
            Run analysis
          </h2>
        </div>

        {isStreaming ? (
          <StreamingIndicator stage={stage} progress={progress} />
        ) : (
          <>
            <button
              onClick={startAnalysis}
              disabled={!canAnalyze}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                canAnalyze
                  ? 'bg-accent hover:bg-accent-hover text-background shadow-[0_0_20px_rgba(0,212,146,0.25)] hover:shadow-[0_0_28px_rgba(0,212,146,0.35)]'
                  : 'bg-surface border border-border text-text-muted cursor-not-allowed'
              )}
            >
              <ScanText className="w-4 h-4" />
              Analyze Resume
            </button>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/20">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{error}</p>
              </div>
            )}

            {!uploadedFile && (
              <p className="text-center text-xs text-text-muted">
                Upload your resume to continue
              </p>
            )}
            {uploadedFile && jobDescription.trim().length < JD_MIN && (
              <p className="text-center text-xs text-text-muted">
                Job description needs {JD_MIN - jobDescription.trim().length} more characters
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
