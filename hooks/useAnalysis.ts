'use client'

import { useQuery } from '@tanstack/react-query'
import type { Analysis } from '@/types'

async function fetchAnalysis(id: string): Promise<Analysis> {
  const res = await fetch(`/api/history/${id}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to fetch analysis.')
  }
  return res.json()
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => fetchAnalysis(id),
    enabled: Boolean(id),
  })
}
