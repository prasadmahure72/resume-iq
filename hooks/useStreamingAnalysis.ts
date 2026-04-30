'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/analysisStore'

interface SseEvent {
  type: 'progress' | 'done' | 'error'
  stage?: string
  progress?: number
  analysisId?: string
  message?: string
}

interface StreamingState {
  isStreaming: boolean
  stage: string
  progress: number
  error: string | null
}

export function useStreamingAnalysis() {
  const router = useRouter()
  const { setIsAnalyzing, setStreamingProgress } = useAnalysisStore()

  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    stage: '',
    progress: 0,
    error: null,
  })

  const abortRef = useRef<AbortController | null>(null)

  const startAnalysis = useCallback(async () => {
    const { uploadedFile, jobTitle, companyName, jobDescription } =
      useAnalysisStore.getState()

    if (!uploadedFile) return

    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    setState({ isStreaming: true, stage: 'reading', progress: 5, error: null })
    setIsAnalyzing(true)
    setStreamingProgress(5)

    const payload = JSON.stringify({
      resumeText: uploadedFile.text,
      jobDescription,
      jobTitle: jobTitle || undefined,
      companyName: companyName || undefined,
      storagePath: uploadedFile.storagePath,
      filename: uploadedFile.filename,
    })

    const doFetch = async (): Promise<void> => {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: abort.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
      }

      if (!res.body) throw new Error('No response body received.')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let event: SseEvent
          try {
            event = JSON.parse(raw) as SseEvent
          } catch {
            continue
          }

          if (event.type === 'progress') {
            const progress = event.progress ?? 0
            setState({
              isStreaming: true,
              stage: event.stage ?? '',
              progress,
              error: null,
            })
            setStreamingProgress(progress)
          } else if (event.type === 'done' && event.analysisId) {
            setState({ isStreaming: false, stage: 'done', progress: 100, error: null })
            setIsAnalyzing(false)
            setStreamingProgress(0)
            router.push(`/results/${event.analysisId}`)
          } else if (event.type === 'error') {
            throw new Error(event.message ?? 'Analysis failed. Please try again.')
          }
        }
      }
    }

    try {
      await doFetch()
    } catch (err) {
      if (abort.signal.aborted) return

      // Retry once on network/parse errors
      try {
        setState((s) => ({ ...s, stage: 'retrying', progress: 10 }))
        await doFetch()
      } catch (retryErr) {
        if (abort.signal.aborted) return
        const message =
          retryErr instanceof Error ? retryErr.message : 'Analysis failed. Please try again.'
        setState({ isStreaming: false, stage: '', progress: 0, error: message })
        setIsAnalyzing(false)
        setStreamingProgress(0)
      }
    }
  }, [router, setIsAnalyzing, setStreamingProgress])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setState({ isStreaming: false, stage: '', progress: 0, error: null })
    setIsAnalyzing(false)
    setStreamingProgress(0)
  }, [setIsAnalyzing, setStreamingProgress])

  return { ...state, startAnalysis, cancel }
}
