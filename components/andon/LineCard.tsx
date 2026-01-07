"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ANDON_STATUS, AndonStatus } from "@/lib/constants"

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export default function LineCard() {
  const [status, setStatus] = useState<AndonStatus>(ANDON_STATUS.IDLE)
  const [workingSeconds, setWorkingSeconds] = useState(0)

  // Timer logic
  useEffect(() => {
    if (status !== ANDON_STATUS.RUNNING) return

    const interval = setInterval(() => {
      setWorkingSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Line Produksi A
          <Badge
            className={
              status === ANDON_STATUS.RUNNING
                ? "bg-green-600"
                : status === ANDON_STATUS.STOP
                ? "bg-red-600"
                : "bg-slate-500"
            }
          >
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-2xl font-mono text-center">
          {formatTime(workingSeconds)}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => setStatus(ANDON_STATUS.RUNNING)}
            disabled={status === ANDON_STATUS.RUNNING}
          >
            Mulai Kerja
          </Button>

          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => setStatus(ANDON_STATUS.STOP)}
            disabled={status === ANDON_STATUS.STOP}
          >
            Stop Kerja
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
