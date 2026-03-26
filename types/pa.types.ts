export type PAScenario =
  | 'APPROVED_READY_TO_SCHEDULE'
  | 'APPROVED_EXPIRING_SOON'
  | 'PENDING_STANDARD'
  | 'PENDING_CMS_VIOLATION'
  | 'PENDING_URGENT'
  | 'PENDING_URGENT_CMS_VIOLATION'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'DENIED_APPEALABLE'
  | 'DENIED_PEER_TO_PEER'
  | 'CANCELLED_PATIENT_NO_SHOW'

export type PAPriority = 'CRITICAL' | 'URGENT' | 'ACTION_REQUIRED' | 'MONITOR' | 'APPROVED'

export type PAUrgencyType = 'STANDARD' | 'URGENT' | 'EXPEDITED'

export type PAOutcomeLikelihood = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_APPLICABLE'

export interface SyntheticPA {
  id: string
  patientFirstName: string
  patientLastName: string
  dateOfBirth: string
  memberId: string
  authorizationNumber: string
  tradingPartnerServiceId: string
  procedureCode: string
  procedureDescription: string
  requestingProviderNPI: string
  requestingProviderName: string
  payerName: string
  urgencyType: PAUrgencyType
  submittedDate: string
  scheduledProcedureDate: string | null
  daysUntilProcedure: number | null
  daysSubmitted: number
  cmsResponseDeadline: string
  isCMSWindowViolated: boolean
  daysCMSOverdue: number | null
  scenario: PAScenario
  priority: PAPriority
  paContext: string
  mockPAScenario: string
}

export interface PAFeedFilters {
  priority: PAPriority | 'ALL'
  scenario: PAScenario | 'ALL'
  payerName: string | 'ALL'
  urgencyType: PAUrgencyType | 'ALL'
}

export type PASortField =
  | 'priority'
  | 'daysUntilProcedure'
  | 'daysSubmitted'
  | 'payerName'
  | 'daysCMSOverdue'

export type SortDirection = 'asc' | 'desc'
