"use client"

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PAStatusBadgeProps {
  statusCode: string
  statusDescription: string
}

export function PAStatusBadge({ statusCode, statusDescription }: PAStatusBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className="font-mono text-[10px] cursor-help">
          {statusCode}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{statusDescription}</p>
      </TooltipContent>
    </Tooltip>
  )
}
