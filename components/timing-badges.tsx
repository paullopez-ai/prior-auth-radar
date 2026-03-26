"use client"

import { Badge } from '@/components/ui/badge'

interface TimingBadgesProps {
  timing: {
    parallelStatusMs: number
    claudeMs: number
    totalMs: number
  } | null
}

export function TimingBadges({ timing }: TimingBadgesProps) {
  if (!timing) return null

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
        PA: {timing.parallelStatusMs}ms
      </Badge>
      <Badge variant="outline" className="font-mono text-[10px] text-brand-secondary">
        AI: {timing.claudeMs}ms
      </Badge>
      <Badge variant="outline" className="font-mono text-[10px]">
        Total: {(timing.totalMs / 1000).toFixed(1)}s
      </Badge>
    </div>
  )
}
