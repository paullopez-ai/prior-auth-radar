"use client"

import { TableCell, TableRow } from '@/components/ui/table'
import { PAPriorityBadge } from '@/components/pa-priority-badge'
import { PAStatusBadge } from '@/components/pa-status-badge'
import { CMSViolationBadge } from '@/components/cms-violation-badge'
import { ProcedureCountdown } from '@/components/procedure-countdown'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import type { PAStatusResult } from '@/types/optum.types'

interface PARowCollapsedProps {
  item: PAStatusResult
  isExpanded: boolean
  onToggleExpand: () => void
}

export function PARowCollapsed({ item, isExpanded, onToggleExpand }: PARowCollapsedProps) {
  const { pa, statusResponse, error } = item

  return (
    <TableRow
      className={cn(
        'cursor-pointer transition-colors hover:bg-muted/50',
        isExpanded && 'bg-muted/30',
        pa.priority === 'CRITICAL' && 'bg-destructive/5 hover:bg-destructive/10',
        error && 'opacity-70'
      )}
      onClick={onToggleExpand}
    >
      <TableCell>
        <PAPriorityBadge priority={pa.priority} />
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {pa.patientFirstName} {pa.patientLastName}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">{pa.authorizationNumber}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <p className="text-sm">{pa.procedureDescription}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{pa.procedureCode}</p>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm">{pa.payerName}</p>
      </TableCell>
      <TableCell className="text-center">
        {error ? (
          <span className="text-xs text-destructive">Error</span>
        ) : (
          <PAStatusBadge
            statusCode={statusResponse.status.statusCode}
            statusDescription={statusResponse.status.statusDescription}
          />
        )}
      </TableCell>
      <TableCell className="text-center">
        {pa.isCMSWindowViolated ? (
          <CMSViolationBadge daysOverdue={pa.daysCMSOverdue} urgencyType={pa.urgencyType} />
        ) : (
          <span className="text-[10px] font-mono text-muted-foreground">OK</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <ProcedureCountdown
          daysUntilProcedure={pa.daysUntilProcedure}
          scheduledProcedureDate={pa.scheduledProcedureDate}
          priority={pa.priority}
        />
      </TableCell>
      <TableCell>
        <HugeiconsIcon
          icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
          className="h-4 w-4 text-muted-foreground"
        />
      </TableCell>
    </TableRow>
  )
}
