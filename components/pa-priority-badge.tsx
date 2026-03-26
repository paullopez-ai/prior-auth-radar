"use client"

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PAPriority } from '@/types/pa.types'

const PRIORITY_CONFIG: Record<
  PAPriority,
  { label: string; className: string; dot?: string }
> = {
  CRITICAL: {
    label: 'CRITICAL',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
    dot: 'bg-brand animate-pulse',
  },
  URGENT: {
    label: 'URGENT',
    className: 'bg-brand/15 text-brand border-brand/30',
  },
  ACTION_REQUIRED: {
    label: 'ACTION',
    className: 'bg-brand/10 text-brand border-brand/20',
  },
  MONITOR: {
    label: 'MONITOR',
    className: 'bg-muted text-muted-foreground border-border',
  },
  APPROVED: {
    label: 'APPROVED',
    className: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  },
}

interface PAPriorityBadgeProps {
  priority: PAPriority
}

export function PAPriorityBadge({ priority }: PAPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]

  return (
    <Badge variant="outline" className={cn('font-mono text-[10px] gap-1.5', config.className)}>
      {config.dot && <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />}
      {config.label}
    </Badge>
  )
}
