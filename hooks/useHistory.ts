'use client'

import { useQuery } from '@tanstack/react-query'
import type { Analysis, PaginatedResponse } from '@/types'

async function fetchHistory(
  page: number,
  limit: number
): Promise<PaginatedResponse<Analysis>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const res = await fetch(`/api/history?${params}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to fetch history.')
  }
  return res.json()
}

export function useHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['history', page, limit],
    queryFn: () => fetchHistory(page, limit),
  })
}
