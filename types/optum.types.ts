import type { SyntheticPA } from './pa.types'
import type { ClaudePAAction, ClaudePAOutcomePrediction, ClaudePAAnalysis } from './claude.types'

export interface PAStatusResponse {
  authorizationNumber: string
  tradingPartnerServiceId: string
  status: {
    statusCode: string
    statusDescription: string
    statusCategory: string
    effectiveDate: string | null
    expirationDate: string | null
  }
  requestedProcedure: {
    procedureCode: string
    procedureDescription: string | null
    serviceTypeCode: string | null
    quantity: number | null
    unitType: string | null
  }
  requestedProvider: {
    npi: string
    organizationName: string | null
    firstName: string | null
    lastName: string | null
  }
  requestingProvider: {
    npi: string
    organizationName: string | null
  }
  member: {
    memberId: string
    firstName: string | null
    lastName: string | null
    dateOfBirth: string | null
    groupNumber: string | null
  }
  payer: {
    name: string
    payerId: string
  }
  submittedDate: string
  scheduledProcedureDate: string | null
  urgencyType: string | null
  denialInfo: {
    isDenied: boolean
    denialReason: string | null
    denialCode: string | null
    appealDeadline: string | null
    peerToPeerAvailable: boolean | null
  }
  additionalInfoRequired: {
    isRequired: boolean
    infoType: string | null
    description: string | null
    dueDate: string | null
  }
  cmsComplianceStatus: {
    standardResponseWindowDays: number | null
    submittedDate: string | null
    responseDeadline: string | null
    isResponseOverdue: boolean | null
    daysOverdue: number | null
  } | null
}

export interface PAStatusGraphQLResponse {
  data?: {
    priorAuthorizationStatus: PAStatusResponse | null
  }
  errors?: Array<{
    message: string
    extensions?: {
      code: string
    }
  }>
}

export interface PAStatusResult {
  pa: SyntheticPA
  statusResponse: PAStatusResponse
  paAction: ClaudePAAction
  paOutcomePrediction: ClaudePAOutcomePrediction | null
  timingMs: number
  error: string | null
}

export interface PAFeedResult {
  paItems: PAStatusResult[]
  paAnalysis: ClaudePAAnalysis
  timing: {
    parallelStatusMs: number
    claudeMs: number
    totalMs: number
  }
  mode: 'mock' | 'sandbox' | 'production'
  successCount: number
  errorCount: number
}
