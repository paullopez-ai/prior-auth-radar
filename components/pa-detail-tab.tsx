"use client"

import { Card, CardContent } from '@/components/ui/card'
import type { PAStatusResult } from '@/types/optum.types'

interface PADetailTabProps {
  item: PAStatusResult
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-mono">{value ?? '—'}</dd>
    </div>
  )
}

export function PADetailTab({ item }: PADetailTabProps) {
  const { pa, statusResponse } = item
  const s = statusResponse

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        {/* Member */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-primary">Member Information</h4>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Patient" value={`${pa.patientFirstName} ${pa.patientLastName}`} />
            <Field label="DOB" value={pa.dateOfBirth} />
            <Field label="Member ID" value={s.member.memberId} />
            <Field label="Group" value={s.member.groupNumber} />
          </dl>
        </div>

        {/* Authorization */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-primary">Authorization</h4>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Auth Number" value={s.authorizationNumber} />
            <Field label="Status" value={`${s.status.statusCode} — ${s.status.statusDescription}`} />
            <Field label="Category" value={s.status.statusCategory} />
            <Field label="Urgency" value={pa.urgencyType} />
            <Field label="Submitted" value={s.submittedDate} />
            <Field label="Effective" value={s.status.effectiveDate} />
            <Field label="Expires" value={s.status.expirationDate} />
            <Field label="Procedure Date" value={pa.scheduledProcedureDate} />
          </dl>
        </div>

        {/* Procedure */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-primary">Procedure</h4>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Code" value={s.requestedProcedure.procedureCode} />
            <Field label="Description" value={s.requestedProcedure.procedureDescription} />
            <Field label="Service Type" value={s.requestedProcedure.serviceTypeCode} />
            <Field label="Quantity" value={s.requestedProcedure.quantity} />
          </dl>
        </div>

        {/* Provider */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-primary">Provider</h4>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Requesting NPI" value={s.requestingProvider.npi} />
            <Field label="Organization" value={s.requestingProvider.organizationName} />
            <Field label="Payer" value={s.payer.name} />
            <Field label="Payer ID" value={s.payer.payerId} />
          </dl>
        </div>

        {/* Denial info */}
        {s.denialInfo.isDenied && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-destructive">Denial Information</h4>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Denial Code" value={s.denialInfo.denialCode} />
              <Field label="Reason" value={s.denialInfo.denialReason} />
              <Field label="Appeal Deadline" value={s.denialInfo.appealDeadline} />
              <Field label="Peer-to-Peer" value={s.denialInfo.peerToPeerAvailable ? 'Available' : 'N/A'} />
            </dl>
          </div>
        )}

        {/* Additional info */}
        {s.additionalInfoRequired.isRequired && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-brand">Additional Information Required</h4>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Info Type" value={s.additionalInfoRequired.infoType} />
              <Field label="Description" value={s.additionalInfoRequired.description} />
              <Field label="Due Date" value={s.additionalInfoRequired.dueDate} />
            </dl>
          </div>
        )}

        {/* CMS Compliance */}
        {s.cmsComplianceStatus && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-brand">CMS Compliance</h4>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Window (days)" value={s.cmsComplianceStatus.standardResponseWindowDays} />
              <Field label="Deadline" value={s.cmsComplianceStatus.responseDeadline} />
              <Field label="Overdue" value={s.cmsComplianceStatus.isResponseOverdue ? 'YES' : 'No'} />
              <Field label="Days Overdue" value={s.cmsComplianceStatus.daysOverdue} />
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
