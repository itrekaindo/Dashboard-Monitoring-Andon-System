'use client'

import { useEffect, useMemo, useState } from 'react'

function formatElapsed(ms: number) {
  if (!isFinite(ms) || ms < 0) return '—'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}j ${m}m ${s}d`
}

export default function Elapsed({ since, className, isPaused = false }: { since?: string | Date | null, className?: string, isPaused?: boolean }) {
  const start = useMemo(() => {
    if (!since) return null
    try {
      return typeof since === 'string' ? new Date(since) : since
    } catch {
      return null
    }
  }, [since])

  const [, forceTick] = useState(0)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => forceTick((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [isPaused])

  if (!start || isNaN(start.getTime())) return <span className={className}>—</span>
  const now = new Date()
  const ms = now.getTime() - start.getTime()
  return <span className={className}>{formatElapsed(ms)}</span>
}
