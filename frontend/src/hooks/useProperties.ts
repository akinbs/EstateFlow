import { useCallback, useEffect, useState } from 'react'
import { getProperties } from '../services/api/propertyApi'
import type { PaginationMeta } from '../types/common'
import type { PropertyFilters, PropertyListItem } from '../types/property'
import { mockProperties } from '../utils/mockData'

interface UsePropertiesResult {
  data: PropertyListItem[]
  meta: PaginationMeta | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useProperties(filters: PropertyFilters = {}): UsePropertiesResult {
  const [data, setData] = useState<PropertyListItem[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // Stable serialized key — re-runs the effect only when filters change
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getProperties(filters)
        if (!cancelled) {
          setData(result.data)
          setMeta(result.meta)
        }
      } catch {
        if (!cancelled) {
          setData(mockProperties as PropertyListItem[])
          setMeta({ total: mockProperties.length, page: 1, limit: mockProperties.length, totalPages: 1, hasNext: false, hasPrev: false })
          setError(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
    // filtersKey is the stable dep; tick triggers manual refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { data, meta, isLoading, error, refetch }
}
