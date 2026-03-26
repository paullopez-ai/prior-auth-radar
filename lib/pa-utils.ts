import type { PAPriority, PASortField, SortDirection, PAFeedFilters } from '@/types/pa.types'
import type { PAStatusResult } from '@/types/optum.types'

const PRIORITY_ORDER: Record<PAPriority, number> = {
  CRITICAL: 0,
  URGENT: 1,
  ACTION_REQUIRED: 2,
  MONITOR: 3,
  APPROVED: 4,
}

export function sortPAItems(
  items: PAStatusResult[],
  field: PASortField,
  direction: SortDirection
): PAStatusResult[] {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'priority':
        comparison =
          PRIORITY_ORDER[a.paAction.priority] -
          PRIORITY_ORDER[b.paAction.priority]
        break
      case 'daysUntilProcedure': {
        const aDays = a.pa.daysUntilProcedure ?? 999
        const bDays = b.pa.daysUntilProcedure ?? 999
        comparison = aDays - bDays
        break
      }
      case 'daysSubmitted':
        comparison = b.pa.daysSubmitted - a.pa.daysSubmitted
        break
      case 'payerName':
        comparison = a.pa.payerName.localeCompare(b.pa.payerName)
        break
      case 'daysCMSOverdue': {
        const aOverdue = a.pa.daysCMSOverdue ?? -1
        const bOverdue = b.pa.daysCMSOverdue ?? -1
        comparison = bOverdue - aOverdue
        break
      }
    }

    return direction === 'asc' ? comparison : -comparison
  })

  return sorted
}

export function filterPAItems(
  items: PAStatusResult[],
  filters: PAFeedFilters
): PAStatusResult[] {
  return items.filter((item) => {
    if (filters.priority !== 'ALL' && item.paAction.priority !== filters.priority)
      return false
    if (filters.scenario !== 'ALL' && item.pa.scenario !== filters.scenario)
      return false
    if (filters.payerName !== 'ALL' && item.pa.payerName !== filters.payerName)
      return false
    if (
      filters.urgencyType !== 'ALL' &&
      item.pa.urgencyType !== filters.urgencyType
    )
      return false
    return true
  })
}

export function calculateDaysUntilProcedure(
  scheduledDate: string | null
): number | null {
  if (!scheduledDate) return null
  const today = new Date('2026-02-28')
  const procedure = new Date(scheduledDate)
  const diffMs = procedure.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function calculateCMSDeadline(
  submittedDate: string,
  urgencyType: string
): string {
  const submitted = new Date(submittedDate)
  const windowDays = urgencyType === 'URGENT' ? 3 : 7
  const deadline = new Date(submitted)
  deadline.setDate(deadline.getDate() + windowDays)
  return deadline.toISOString().split('T')[0]
}

export function isCMSWindowViolated(
  cmsResponseDeadline: string
): boolean {
  const today = new Date('2026-02-28')
  const deadline = new Date(cmsResponseDeadline)
  return today > deadline
}

export function getUniquePayers(items: PAStatusResult[]): string[] {
  const payers = new Set(items.map((item) => item.pa.payerName))
  return Array.from(payers).sort()
}
