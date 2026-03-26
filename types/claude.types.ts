import type { PAPriority, PAOutcomeLikelihood } from './pa.types'

export interface ClaudePAAction {
  priority: PAPriority
  priorityReason: string
  immediateAction: string | null
  actionDeadline: string | null
  actionSteps: Array<{
    stepNumber: number
    step: string
    estimatedTime: string
  }>
  cmsComplianceAction: string | null
  statusInterpretation: string
  riskAssessment: {
    procedureDateRisk: boolean
    cmsViolationRisk: boolean
    denialRisk: boolean
    appealDeadlineRisk: boolean
    riskSummary: string | null
  }
  recommendedDocumentation: string[]
  contactPayer: boolean
  contactPayerReason: string | null
}

export interface ClaudePAOutcomePrediction {
  approvalLikelihood: PAOutcomeLikelihood
  confidenceExplanation: string
  keyFactors: Array<{
    factor: string
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    explanation: string
  }>
  likelyDenialReason: string | null
  bestApproachToApproval: string
  peerToPeerRecommended: boolean
  alternativeProcedureCode: string | null
}

export interface ClaudePASummary {
  criticalCount: number
  urgentCount: number
  actionRequiredCount: number
  monitorCount: number
  approvedCount: number
  totalPAsInFeed: number
  cmsViolationCount: number
  proceduresAtRiskCount: number
  topThreeActions: Array<{
    rank: number
    action: string
    affectedPAIds: string[]
    urgencyReason: string
  }>
  practiceHealthSummary: string
  cmsComplianceSummary: string | null
  flaggedForImmediateAttention: string[]
  insight: string
}

export interface ClaudePAAnalysis {
  perPAActions: Record<string, ClaudePAAction>
  perPAPredictions: Record<string, ClaudePAOutcomePrediction | null>
  paSummary: ClaudePASummary
}
