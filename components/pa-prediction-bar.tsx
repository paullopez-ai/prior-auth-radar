"use client"

import { Progress } from '@/components/ui/progress'
import type { PAOutcomeLikelihood } from '@/types/pa.types'

const LIKELIHOOD_VALUES: Record<PAOutcomeLikelihood, number> = {
  HIGH: 85,
  MEDIUM: 50,
  LOW: 15,
  NOT_APPLICABLE: 0,
}

interface PAPredictionBarProps {
  likelihood: PAOutcomeLikelihood
}

export function PAPredictionBar({ likelihood }: PAPredictionBarProps) {
  const value = LIKELIHOOD_VALUES[likelihood]

  return (
    <div className="w-full max-w-md mx-auto">
      <Progress
        value={value}
        className="h-2 bg-muted [&>div]:bg-brand-secondary"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-muted-foreground">0%</span>
        <span className="text-[10px] font-mono text-muted-foreground">100%</span>
      </div>
    </div>
  )
}
