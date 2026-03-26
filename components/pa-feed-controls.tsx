"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PAPriority, PAUrgencyType, PASortField, SortDirection } from '@/types/pa.types'

interface PAFeedControlsProps {
  sortField: PASortField
  sortDirection: SortDirection
  priorityFilter: PAPriority | 'ALL'
  payerFilter: string | 'ALL'
  urgencyFilter: PAUrgencyType | 'ALL'
  payers: string[]
  onSortFieldChange: (field: PASortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
  onPriorityFilterChange: (p: PAPriority | 'ALL') => void
  onPayerFilterChange: (p: string | 'ALL') => void
  onUrgencyFilterChange: (u: PAUrgencyType | 'ALL') => void
}

export function PAFeedControls({
  sortField,
  sortDirection,
  priorityFilter,
  payerFilter,
  urgencyFilter,
  payers,
  onSortFieldChange,
  onSortDirectionChange,
  onPriorityFilterChange,
  onPayerFilterChange,
  onUrgencyFilterChange,
}: PAFeedControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as PASortField)}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="daysUntilProcedure">Procedure Date</SelectItem>
          <SelectItem value="daysSubmitted">Days Submitted</SelectItem>
          <SelectItem value="payerName">Payer</SelectItem>
          <SelectItem value="daysCMSOverdue">CMS Overdue</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortDirection} onValueChange={(v) => onSortDirectionChange(v as SortDirection)}>
        <SelectTrigger className="w-[100px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Asc</SelectItem>
          <SelectItem value="desc">Desc</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={(v) => onPriorityFilterChange(v as PAPriority | 'ALL')}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Priorities</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
          <SelectItem value="ACTION_REQUIRED">Action Required</SelectItem>
          <SelectItem value="MONITOR">Monitor</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
        </SelectContent>
      </Select>

      <Select value={payerFilter} onValueChange={(v) => onPayerFilterChange(v ?? 'ALL')}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Payer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Payers</SelectItem>
          {payers.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={urgencyFilter} onValueChange={(v) => onUrgencyFilterChange(v as PAUrgencyType | 'ALL')}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Urgency</SelectItem>
          <SelectItem value="STANDARD">Standard</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
