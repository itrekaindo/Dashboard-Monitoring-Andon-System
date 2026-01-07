// app/components/andon/WorkstationCard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AndonStatus } from "@/lib/andon"

export interface WorkstationCardProps {
  id: string
  name: string
  initialStatus?: AndonStatus
}

export default function WorkstationCard({
  name,
  initialStatus = "IDLE",
}: WorkstationCardProps) {
  const [status, setStatus] = useState<AndonStatus>(initialStatus)
  const [workTime, setWorkTime] = useState(0)
  const [stopTime, setStopTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (status === "RUNNING") {
        setWorkTime((t) => t + 1)
      } else if (status === "STOP") {
        setStopTime((t) => t + 1)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  const handleStart = () => {
    if (status !== "RUNNING") {
      setStatus("RUNNING")
    }
  }

  const handleStop = () => {
    if (status !== "STOP") {
      setStatus("STOP")
    }
  }

  const handleReset = () => {
    setStatus("IDLE")
    setWorkTime(0)
    setStopTime(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {name}
          <Badge
            className={
              status === "RUNNING"
                ? "bg-green-600"
                : status === "STOP"
                ? "bg-red-600"
                : "bg-slate-500"
            }
          >
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Work:</span>
          <span className="font-mono">{workTime}s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Stop:</span>
          <span className="font-mono">{stopTime}s</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleStart}
            disabled={status === "RUNNING"}
            className="flex-1"
          >
            Mulai
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleStop}
            disabled={status === "STOP"}
            className="flex-1"
          >
            Stop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}