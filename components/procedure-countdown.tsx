"use client"

import { cn } from '@/lib/utils'
import type { PAPriority } from '@/types/pa.types'

interface ProcedureCountdownProps {
  daysUntilProcedure: number | null
  scheduledProcedureDate: string | null
  priority: PAPriority
}

export function ProcedureCountdown({
  daysUntilProcedure,
  scheduledProcedureDate,
  priority,
}: ProcedureCountdownProps) {
  if (daysUntilProcedure === null || !scheduledProcedureDate) {
    return (
      <span className="text-xs text-muted-foreground font-mono">
        No date
      </span>
    )
  }

  const isCritical = priority === 'CRITICAL' || daysUntilProcedure <= 1
  const isUrgent = daysUntilProcedure <= 5

  const label =
    daysUntilProcedure === 0
      ? 'Today'
      : daysUntilProcedure === 1
        ? 'Tomorrow'
        : `${daysUntilProcedure}d`

  return (
    <span
      className={cn(
        'font-mono text-xs font-semibold',
        isCritical && 'text-destructive animate-pulse',
        !isCritical && isUrgent && 'text-brand',
        !isCritical && !isUrgent && 'text-muted-foreground'
      )}
    >
      {label}
    </span>
  )
}
