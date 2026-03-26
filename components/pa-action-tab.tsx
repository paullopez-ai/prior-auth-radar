"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PAPriorityBadge } from '@/components/pa-priority-badge'
import { PAActionSteps } from '@/components/pa-action-steps'
import { AlertCircleIcon, CallIcon, DocumentAttachmentIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ClaudePAAction } from '@/types/claude.types'
import type { SyntheticPA } from '@/types/pa.types'

interface PAActionTabProps {
  action: ClaudePAAction
  pa: SyntheticPA
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PAActionTab({ action, pa }: PAActionTabProps) {
  return (
    <Card className="border-brand-secondary/20">
      <CardContent className="p-4 space-y-4">
        {/* Priority and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PAPriorityBadge priority={action.priority} />
            <span className="text-sm text-muted-foreground">{action.priorityReason}</span>
          </div>
          {action.actionDeadline && (
            <Badge variant="outline" className="font-mono text-[10px] border-brand/30 text-brand">
              {action.actionDeadline}
            </Badge>
          )}
        </div>

        {/* Status interpretation */}
        <p className="text-sm border-l-2 border-brand-secondary/40 pl-3">
          {action.statusInterpretation}
        </p>

        {/* Immediate action */}
        {action.immediateAction && (
          <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/15">
            <p className="text-sm font-semibold text-brand-secondary">{action.immediateAction}</p>
          </div>
        )}

        {/* CMS compliance action */}
        {action.cmsComplianceAction && (
          <div className="p-3 bg-brand/5 border border-brand/20">
            <div className="flex items-start gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-brand mb-1">CMS Compliance Escalation</h4>
                <p className="text-sm">{action.cmsComplianceAction}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action steps */}
        {action.actionSteps.length > 0 && (
          <PAActionSteps steps={action.actionSteps} />
        )}

        {/* Risk assessment */}
        {action.riskAssessment.riskSummary && (
          <div className="p-3 bg-brand/5 border border-brand/15">
            <p className="text-sm text-brand">
              <HugeiconsIcon icon={AlertCircleIcon} className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              {action.riskAssessment.riskSummary}
            </p>
          </div>
        )}

        {/* Recommended documentation */}
        {action.recommendedDocumentation.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={DocumentAttachmentIcon} className="h-3.5 w-3.5" />
              Recommended Documentation
            </h4>
            <ul className="space-y-1 pl-5">
              {action.recommendedDocumentation.map((doc, i) => (
                <li key={i} className="text-sm text-muted-foreground list-disc">{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact payer */}
        {action.contactPayer && action.contactPayerReason && (
          <div className="flex items-center gap-2 p-2 bg-brand/5 border border-brand/15">
            <HugeiconsIcon icon={CallIcon} className="h-4 w-4 text-brand" />
            <p className="text-sm">{action.contactPayerReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
