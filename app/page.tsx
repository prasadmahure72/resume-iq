import Link from 'next/link'
import {
  ScanText,
  Zap,
  Target,
  BarChart3,
  FileText,
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Clock,
} from 'lucide-react'

function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <ScanText className="w-4 h-4 text-background" />
          </div>
          <span className="font-semibold text-text-primary text-lg tracking-tight">
            ResumeIQ
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-background transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  )
}

function MockScoreCard() {
  const overall = 82
  const ats = 74
  const r1 = 30
  const c1 = 2 * Math.PI * r1
  const r2 = 24
  const c2 = 2 * Math.PI * r2

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full -z-10" />
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">senior_engineer_cv.pdf</p>
            <p className="text-xs text-text-muted">Senior Engineer · Acme Corp</p>
          </div>
        </div>

        {/* Scores */}
        <div className="p-5 flex items-center gap-6 border-b border-border">
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r1} stroke="#1a1a1e" strokeWidth="8" fill="none" />
                <circle
                  cx="40" cy="40" r={r1}
                  stroke="#10b981" strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={c1}
                  strokeDashoffset={c1 * (1 - overall / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-success tabular-nums">{overall}</span>
              </div>
            </div>
            <p className="text-xs text-text-muted">Overall</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={r2} stroke="#1a1a1e" strokeWidth="7" fill="none" />
                <circle
                  cx="32" cy="32" r={r2}
                  stroke="#f59e0b" strokeWidth="7" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={c2}
                  strokeDashoffset={c2 * (1 - ats / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-warning tabular-nums">{ats}</span>
              </div>
            </div>
            <p className="text-xs text-text-muted">ATS Score</p>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted leading-relaxed">
              Strong technical background. Missing a few critical frameworks required by the JD.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="p-5 space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Quick Insights
          </p>
          {[
            { ok: true, text: 'Strong project impact metrics' },
            { ok: true, text: 'Good keyword density for role' },
            { ok: false, text: 'Missing: Kubernetes, Terraform' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-text-secondary">
              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-danger shrink-0" />
              )}
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: Target,
    title: 'ATS Score Analysis',
    desc: 'Know exactly how applicant tracking systems score your resume before a human ever sees it.',
  },
  {
    icon: BarChart3,
    title: 'Gap Detection',
    desc: 'Instantly spot missing keywords and skills the job description requires that your resume lacks.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    desc: 'Section-by-section scoring and actionable improvements delivered in seconds, not days.',
  },
  {
    icon: FileText,
    title: 'Rewrite Suggestions',
    desc: 'See before-and-after rewrites of your weakest bullet points, optimised for the target role.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Upload your resume',
    desc: 'Drag and drop your PDF. Text is extracted server-side — your file stays private.',
  },
  {
    n: '02',
    title: 'Add the job description',
    desc: 'Paste the full JD from any job board. The more detail, the sharper the analysis.',
  },
  {
    n: '03',
    title: 'Get your report',
    desc: 'Scores, gaps, suggestions, and rewrite examples — ready in under 30 seconds.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* ── Hero ─────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-xs font-medium text-accent">
                <Star className="w-3.5 h-3.5" />
                AI-Powered Resume Analysis
              </div>

              <div className="space-y-5">
                <h1 className="text-5xl lg:text-6xl font-serif text-text-primary leading-tight">
                  Your resume,{' '}
                  <span className="text-accent">brutally</span> analyzed.
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
                  Upload your resume, paste a job description, and get an instant ATS score,
                  keyword gap report, and rewrite suggestions — all in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-all shadow-[0_0_24px_rgba(0,212,146,0.3)] hover:shadow-[0_0_32px_rgba(0,212,146,0.4)]"
                >
                  Analyze My Resume
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors text-sm"
                >
                  Already have an account?
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {[
                  { icon: Shield, text: 'Private & secure' },
                  { icon: Clock, text: 'Results in 30s' },
                  { icon: Zap, text: 'Free to start' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock card */}
            <MockScoreCard />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────── */}
      <section className="border-y border-border bg-surface/50 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {[
            { value: '< 30s', label: 'Analysis time' },
            { value: '100%', label: 'Server-side privacy' },
            { value: '6+', label: 'Resume sections scored' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1">
              <p className="text-3xl font-bold text-accent tabular-nums">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              How it works
            </p>
            <h2 className="text-3xl font-serif text-text-primary">
              Three steps to a better resume
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n} className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">{step.n}</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────── */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest">
              Features
            </p>
            <h2 className="text-3xl font-serif text-text-primary">
              Everything you need to beat the competition
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-surface border border-border rounded-2xl p-6 space-y-4 hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/3 -z-10" />
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif text-text-primary">
              Ready to land your dream job?
            </h2>
            <p className="text-lg text-text-secondary">
              Stop guessing. Get a brutally honest score and a clear action plan in under 30 seconds.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-all text-lg shadow-[0_0_32px_rgba(0,212,146,0.3)] hover:shadow-[0_0_40px_rgba(0,212,146,0.45)]"
            >
              Get Your Free Analysis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-text-muted">No credit card required · Your data stays private</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <ScanText className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold text-text-primary">ResumeIQ</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} ResumeIQ · Developed by Prasad M
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
