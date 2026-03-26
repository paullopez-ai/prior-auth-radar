"use client"

import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface CMSComplianceSummaryProps {
  summary: string
  violationCount: number
}

export function CMSComplianceSummary({ summary, violationCount }: CMSComplianceSummaryProps) {
  return (
    <div className="p-3 bg-brand/5 border border-brand/20">
      <div className="flex items-start gap-2">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-semibold text-brand mb-1">
            CMS Compliance — {violationCount} Violation{violationCount !== 1 ? 's' : ''}
          </h3>
          <p className="text-sm">{summary}</p>
        </div>
      </div>
    </div>
  )
}
