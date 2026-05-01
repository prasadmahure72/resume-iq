# ResumeIQ — AI-Powered Resume Analyzer

A production-grade SaaS application that analyzes resumes against job descriptions using the Anthropic Claude API. Built with Next.js 16, TypeScript, Supabase, and Tailwind CSS v4.

> **Developed by [Prasad M](https://github.com/prasadmahure72)**

---

## What It Does

Users upload a PDF resume and paste a job description. The app extracts text server-side, streams an AI analysis via Server-Sent Events, and delivers a detailed report including:

- **Overall score & ATS score** — calibrated 0–100 ratings with honest, recruiter-grade feedback
- **Keyword gap analysis** — missing terms from the JD, grouped by importance (critical / important / nice-to-have)
- **Section-by-section breakdown** — per-section scores with targeted improvement suggestions
- **Rewrite examples** — before/after rewrites of weak bullet points, optimised for the target role
- **Prioritised action list** — high/medium/low suggestions ranked by hiring impact

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 — strict mode |
| Styling | Tailwind CSS v4 (CSS-first config, `@theme inline`) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (private PDF bucket) |
| AI | Anthropic Claude (`claude-haiku-4-5`) |
| PDF Parsing | pdfjs-dist v5 (server-side, no browser APIs) |
| State | Zustand (client upload state) |
| Data Fetching | TanStack Query v5 |
| Charts | Recharts (RadialBar score rings) |
| Forms | React Hook Form + Zod v4 |
| Notifications | Sonner |
| Deployment | Vercel-ready |

---

## Architecture Highlights

### Streaming AI Analysis
The `/api/analyze` route streams Server-Sent Events (SSE) directly from the Anthropic API to the browser. Progress updates fire in real-time as Claude generates tokens — no fake loaders, no polling.

```
Browser → POST /api/analyze
         ← SSE: { type: "progress", stage: "reading",   progress: 10 }
         ← SSE: { type: "progress", stage: "analyzing", progress: 45 }
         ← SSE: { type: "progress", stage: "saving",    progress: 90 }
         ← SSE: { type: "done",     analysisId: "uuid", progress: 100 }
```

### Prompt Caching
The static system prompt is marked with `cache_control: { type: "ephemeral" }` and the `anthropic-beta: prompt-caching-2024-07-31` header. Repeated analyses of the same job description hit the cache, reducing token spend by up to 90% on the system prefix.

### Server-Side PDF Parsing
PDF text extraction runs entirely on the server using `pdfjs-dist` with an explicit worker path resolved via `process.cwd()`. The file never touches the browser's memory after upload. Heavy native modules (`pdfjs-dist`, `canvas`) are excluded from Turbopack bundling via `serverExternalPackages`.

### Row-Level Security
Every Supabase table has RLS enabled. Users can only read, insert, update, and delete their own rows — enforced at the database level, not just the API layer.

### Next.js 16 Patterns
- All `cookies()`, `headers()`, and route `params` are awaited (fully async as required by Next.js 16)
- `proxy.ts` replaces `middleware.ts` for route protection (Next.js 16 renamed convention)
- `maxDuration = 120` on the analyze route to support long AI responses without timeout

---

## Project Structure

```
resume-iq/
├── app/
│   ├── (auth)/              # Login & signup pages
│   ├── (dashboard)/         # Protected app shell
│   │   ├── analyze/         # Resume upload + job description form
│   │   ├── dashboard/       # Stats + recent analyses
│   │   ├── history/         # Paginated analysis history + delete
│   │   ├── results/[id]/    # Full analysis results page
│   │   └── settings/        # Account settings
│   ├── api/
│   │   ├── analyze/         # SSE streaming AI analysis route
│   │   ├── upload/          # PDF upload + text extraction
│   │   └── history/         # Paginated history + per-item GET/DELETE
│   └── page.tsx             # Marketing landing page
├── components/
│   ├── analyze/             # ResumeUploader, drag-and-drop
│   ├── auth/                # LoginForm, SignUpForm, AuthBrandPanel
│   ├── history/             # HistoryTable, DeleteButton
│   ├── layout/              # Sidebar, TopBar, MobileNav
│   ├── results/             # ScoreRing, SectionFeedback, KeywordGaps, SuggestionsPanel, StreamingIndicator
│   └── settings/            # ProfileForm
├── hooks/
│   ├── useStreamingAnalysis.ts   # SSE consumer with retry logic
│   ├── useAnalysis.ts            # TanStack Query wrapper
│   └── useHistory.ts             # TanStack Query wrapper
├── lib/
│   ├── claude.ts            # Anthropic client, system prompt, prompt caching
│   ├── pdf.ts               # pdfjs-dist server-side text extraction
│   ├── supabase/            # Server + client Supabase helpers
│   ├── utils.ts             # cn, formatDate, score helpers
│   └── validations.ts       # Zod schemas
├── store/
│   └── analysisStore.ts     # Zustand store for upload + analysis state
├── types/
│   └── index.ts             # AnalysisResult, Analysis, Profile, etc.
└── supabase/
    └── migrations/          # SQL migrations with RLS policies
```

---

## Key Engineering Decisions

**Why SSE instead of WebSockets?**
The analysis is strictly server-to-client (unidirectional). SSE is simpler, works over HTTP/1.1, auto-reconnects, and is natively supported by `fetch` — no library needed.

**Why Haiku over GPT or a larger model?**
Speed and cost. `claude-haiku-4-5` produces high-quality structured JSON in under 30 seconds at a fraction of the cost of larger models. Prompt caching further reduces token spend on repeated patterns.

**Why server-side PDF parsing?**
Security and reliability. Running pdfjs-dist on the server avoids shipping a 3 MB WASM bundle to the browser, prevents client-side crashes on complex PDFs, and ensures the raw text never leaves the server uncontrolled.

**Why Zustand over Context API?**
The upload state is shared across multiple components (uploader, job form, analyze button) without a common parent. Zustand avoids prop drilling and unnecessary re-renders with zero boilerplate.

---

## Local Setup

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Steps

```bash
# 1. Clone and install
git clone https://github.com/prasadmahure72/resume-iq.git
cd resume-iq
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, service role key, and Anthropic API key

# 3. Run the database migrations
# Open Supabase Dashboard → SQL Editor and run:
# supabase/migrations/001_initial.sql
# supabase/migrations/002_analyses_update_policy.sql

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Schema

```sql
-- Profiles (extends Supabase auth.users)
profiles (id, email, full_name, avatar_url, analyses_count, created_at, updated_at)

-- Analyses (core data)
analyses (id, user_id, resume_filename, resume_storage_path, job_title,
          company_name, job_description, resume_text, overall_score,
          result jsonb, status, created_at)
```

All tables have RLS enabled with per-user policies for SELECT, INSERT, UPDATE, and DELETE.

---

## Features Overview

| Feature | Status |
|---|---|
| PDF upload with drag-and-drop | ✅ |
| Server-side PDF text extraction | ✅ |
| Real-time streaming AI analysis | ✅ |
| ATS + overall score rings | ✅ |
| Keyword gap chips (grouped by importance) | ✅ |
| Section-by-section accordion feedback | ✅ |
| Before/after rewrite examples | ✅ |
| Prioritised suggestions panel | ✅ |
| Analysis history with pagination | ✅ |
| Delete analysis + storage cleanup | ✅ |
| Account settings with profile update | ✅ |
| Google OAuth | ✅ |
| Dark theme, mobile-responsive sidebar | ✅ |
| Marketing landing page | ✅ |
| Prompt caching (token cost reduction) | ✅ |

---

## Author

**Prasad M** — [GitHub](https://github.com/prasadmahure72) · [Email](mailto:prasadmahure72@gmail.com)

Built as a portfolio project demonstrating full-stack TypeScript, AI integration, real-time streaming, and production SaaS patterns.
