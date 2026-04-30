import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, CLAUDE_MODEL, MAX_TOKENS, getSystemBlocks, buildUserMessage } from '@/lib/claude'
import { analyzeSchema } from '@/lib/validations'
import type { AnalysisResult } from '@/types'

export const maxDuration = 120

function sse(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

function parseAnalysisJson(raw: string): AnalysisResult {
  const stripped = raw.replace(/^```json\s*|\s*```$/g, '').trim()
  return JSON.parse(stripped) as AnalysisResult
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.', code: 'CONFIG_ERROR' },
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'You must be signed in to analyze a resume.', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  const parsed = analyzeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', code: 'VALIDATION_ERROR', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { resumeText, jobDescription, jobTitle, companyName, storagePath, filename } = parsed.data

  const { data: analysis, error: insertError } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      resume_filename: filename,
      resume_storage_path: storagePath ?? null,
      job_title: jobTitle ?? null,
      company_name: companyName ?? null,
      job_description: jobDescription,
      resume_text: resumeText,
      overall_score: 0,
      result: {},
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !analysis) {
    console.error('[analyze] insert error:', insertError)
    return NextResponse.json(
      { error: 'Failed to create analysis record.', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  const analysisId = analysis.id as string

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(sse(data))

      const runClaude = async (): Promise<string> => {
        const msgStream = anthropic.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          system: getSystemBlocks() as any,
          messages: [{ role: 'user', content: buildUserMessage(resumeText, jobDescription, jobTitle, companyName) }],
        })

        let text = ''
        for await (const event of msgStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            text += event.delta.text
            // Map accumulated chars to 20–85% progress range
            const ratio = Math.min(text.length / (MAX_TOKENS * 4), 1)
            send({ type: 'progress', stage: 'analyzing', progress: Math.round(20 + ratio * 65) })
          }
        }
        return text
      }

      try {
        send({ type: 'progress', stage: 'reading', progress: 10 })
        await supabase.from('analyses').update({ status: 'processing' }).eq('id', analysisId)
        send({ type: 'progress', stage: 'analyzing', progress: 20 })

        const rawJson = await runClaude()
        const result = parseAnalysisJson(rawJson)

        send({ type: 'progress', stage: 'saving', progress: 90 })

        const { error: updateError } = await supabase
          .from('analyses')
          .update({ overall_score: result.overall_score, result, status: 'completed' })
          .eq('id', analysisId)

        if (updateError) throw new Error(updateError.message)

        // Best-effort profile counter increment
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('analyses_count')
            .eq('id', user.id)
            .single()
          if (profile) {
            await supabase
              .from('profiles')
              .update({ analyses_count: (profile.analyses_count ?? 0) + 1 })
              .eq('id', user.id)
          }
        } catch {
          // Non-critical — ignore
        }

        send({ type: 'done', analysisId, progress: 100 })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
        console.error('[analyze] error:', message, err)
        await supabase.from('analyses').update({ status: 'failed' }).eq('id', analysisId)
        send({ type: 'error', message, analysisId })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
