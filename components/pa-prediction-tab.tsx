"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PAPredictionBar } from '@/components/pa-prediction-bar'
import { CheckmarkCircle01Icon, AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import type { ClaudePAOutcomePrediction } from '@/types/claude.types'
import type { SyntheticPA } from '@/types/pa.types'
import type { PAStatusResponse } from '@/types/optum.types'

interface PAPredictionTabProps {
  prediction: ClaudePAOutcomePrediction | null
  pa: SyntheticPA
  statusResponse: PAStatusResponse
}

const IMPACT_ICONS = {
  POSITIVE: CheckmarkCircle01Icon,
  NEGATIVE: AlertCircleIcon,
  NEUTRAL: InformationCircleIcon,
}

const IMPACT_COLORS = {
  POSITIVE: 'text-green-600 dark:text-green-400',
  NEGATIVE: 'text-destructive',
  NEUTRAL: 'text-muted-foreground',
}

const IMPACT_BADGE_COLORS = {
  POSITIVE: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  NEGATIVE: 'bg-destructive/15 text-destructive border-destructive/30',
  NEUTRAL: 'bg-muted text-muted-foreground border-border',
}

const LIKELIHOOD_COLORS = {
  HIGH: 'text-green-600 dark:text-green-400',
  MEDIUM: 'text-brand',
  LOW: 'text-destructive',
  NOT_APPLICABLE: 'text-muted-foreground',
}

export function PAPredictionTab({ prediction, pa, statusResponse }: PAPredictionTabProps) {
  // Approved PAs show green confirmation
  if (!prediction) {
    const isApproved = pa.scenario.startsWith('APPROVED')
    if (isApproved) {
      return (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 text-center space-y-2">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto"
            />
            <h3 className="font-display text-lg text-green-700 dark:text-green-400">
              Authorization Approved
            </h3>
            <p className="text-sm text-muted-foreground">
              No outcome prediction required.
              {statusResponse.status.expirationDate && (
                <> Expires <span className="font-mono">{statusResponse.status.expirationDate}</span>.</>
              )}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center text-muted-foreground">
          Outcome prediction unavailable.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-brand-secondary/20">
      <CardContent className="p-4 space-y-4">
        {/* Approval likelihood header */}
        <div className="text-center space-y-2">
          <h3 className={cn('font-display text-2xl font-bold', LIKELIHOOD_COLORS[prediction.approvalLikelihood])}>
            {prediction.approvalLikelihood} Approval Likelihood
          </h3>
          <PAPredictionBar likelihood={prediction.approvalLikelihood} />
        </div>

        {/* Confidence explanation */}
        <p className="text-sm text-muted-foreground">{prediction.confidenceExplanation}</p>

        {/* Key factors */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold">Key Factors</h4>
          <div className="space-y-2">
            {prediction.keyFactors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={IMPACT_ICONS[factor.impact]}
                  className={cn('h-4 w-4 shrink-0 mt-0.5', IMPACT_COLORS[factor.impact])}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', IMPACT_BADGE_COLORS[factor.impact])}>
                      {factor.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{factor.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best approach */}
        <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/20">
          <h4 className="text-xs font-semibold text-brand-secondary mb-1">Best Approach to Approval</h4>
          <p className="text-sm">{prediction.bestApproachToApproval}</p>
        </div>

        {/* Likely denial reason */}
        {prediction.likelyDenialReason && (
          <div className="p-3 bg-brand/5 border border-brand/15">
            <h4 className="text-xs font-semibold text-brand mb-1">Likely Denial Reason</h4>
            <p className="text-sm">{prediction.likelyDenialReason}</p>
          </div>
        )}

        {/* Peer-to-peer recommendation */}
        {prediction.peerToPeerRecommended && (
          <Badge variant="outline" className="bg-brand/10 text-brand border-brand/30">
            Peer-to-Peer Review Recommended
          </Badge>
        )}

        {/* Alternative procedure code */}
        {prediction.alternativeProcedureCode && (
          <div className="p-2 bg-muted text-sm">
            Alternative code with higher approval rates:{' '}
            <span className="font-mono font-semibold">{prediction.alternativeProcedureCode}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
