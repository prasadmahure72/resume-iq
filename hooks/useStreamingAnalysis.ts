'use client'

// Implemented in Step 13
import { useState, useCallback } from 'react'
import type { AnalysisResult } from '@/types'

interface StreamingState {
  isStreaming: boolean
  progress: number
  error: string | null
  partialResult: Partial<AnalysisResult> | null
}

interface StartAnalysisParams {
  resumeText: string
  jobDescription: string
  jobTitle?: string
  companyName?: string
  storagePath?: string
  filename: string
}

export function useStreamingAnalysis() {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: 0,
    error: null,
    partialResult: null,
  })

  const startAnalysis = useCallback(
    async (_params: StartAnalysisParams): Promise<void> => {
      // Full implementation in Step 13
      setState((s) => ({ ...s, isStreaming: true, error: null, progress: 0 }))
      try {
        throw new Error('Streaming not yet implemented.')
      } catch (err) {
        setState((s) => ({
          ...s,
          isStreaming: false,
          error: err instanceof Error ? err.message : 'Unknown error.',
        }))
      }
    },
    []
  )

  return { startAnalysis, ...state }
}
