import { CheckCircle2, FileText } from 'lucide-react'

const FEATURES = [
  'AI-powered ATS score with honest, calibrated feedback',
  'Keyword gap analysis against any job description',
  'Section-by-section breakdown with targeted rewrites',
  'Prioritized action items ranked by hiring impact',
]

export function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-semibold text-text-primary tracking-tight">
          ResumeIQ
        </span>
      </div>

      {/* Hero copy */}
      <div>
        <h1 className="text-4xl font-serif text-text-primary leading-[1.15] mb-5">
          Your resume.
          <br />
          Brutally analyzed.
        </h1>
        <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-xs">
          Get the same feedback a senior recruiter gives — before you
          even hit send.
        </p>

        <ul className="space-y-3.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-success mt-0.5 shrink-0" />
              <span className="text-text-secondary text-sm leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-text-muted text-xs">
        © {new Date().getFullYear()} Developed by Prasad M
      </p>
    </div>
  )
}
