"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CMSComplianceSummary } from '@/components/cms-compliance-summary'
import { BulbIcon, TaskDone01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ClaudePASummary } from '@/types/claude.types'

interface PASummaryPanelProps {
  summary: ClaudePASummary | null
}

export function PASummaryPanel({ summary }: PASummaryPanelProps) {
  if (!summary) {
    return (
      <Card className="border-muted">
        <CardContent className="p-6 text-center text-muted-foreground">
          PA intelligence summary unavailable — showing raw data.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-brand-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg text-brand-secondary flex items-center gap-2">
          <HugeiconsIcon icon={BulbIcon} className="h-5 w-5" />
          PA Intelligence Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top 3 Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <HugeiconsIcon icon={TaskDone01Icon} className="h-4 w-4 text-brand" />
            Top 3 Actions Today
          </h3>
          <div className="space-y-2">
            {summary.topThreeActions.map((action) => (
              <div
                key={action.rank}
                className="flex gap-3 p-3 bg-brand-secondary/5 border border-brand-secondary/15"
              >
                <span className="font-mono text-sm font-bold text-brand-secondary shrink-0">
                  {action.rank}.
                </span>
                <div className="space-y-1">
                  <p className="text-sm">{action.action}</p>
                  <p className="text-xs text-muted-foreground">{action.urgencyReason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CMS Compliance Summary */}
        {summary.cmsComplianceSummary && (
          <CMSComplianceSummary
            summary={summary.cmsComplianceSummary}
            violationCount={summary.cmsViolationCount}
          />
        )}

        {/* Practice Health */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Practice PA Health</h3>
          <p className="text-sm text-muted-foreground">{summary.practiceHealthSummary}</p>
        </div>

        {/* Insight */}
        <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/20">
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={BulbIcon} className="h-4 w-4 text-brand-secondary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-brand-secondary mb-1">AI Insight</h3>
              <p className="text-sm">{summary.insight}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
