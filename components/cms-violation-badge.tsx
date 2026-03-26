"use client"

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface CMSViolationBadgeProps {
  daysOverdue: number | null
  urgencyType: string
}

export function CMSViolationBadge({ daysOverdue, urgencyType }: CMSViolationBadgeProps) {
  const windowType = urgencyType === 'URGENT' ? '72-hour urgent' : '7-day standard'

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant="outline"
          className="bg-brand/15 text-brand border-brand/30 font-mono text-[10px] gap-1 animate-pulse cursor-help"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3" />
          CMS VIOLATION
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-xs">
          This payer has exceeded the CMS Prior Authorization Final Rule {windowType} response
          window.{daysOverdue !== null ? ` ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue.` : ''}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
