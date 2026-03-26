import type { PAStatusResponse } from '@/types/optum.types'
import type { ClaudePAAnalysis } from '@/types/claude.types'
import type { SyntheticPA } from '@/types/pa.types'

const SYSTEM_PROMPT = `You are an expert healthcare revenue cycle specialist and prior authorization analyst with deep knowledge of payer authorization workflows, CMS prior authorization regulations (effective January 2026), denial management, peer-to-peer review processes, and clinical documentation requirements across major US commercial payers and Medicare Advantage plans.

Your job is to analyze a set of outstanding prior authorization requests from a medical practice and produce three outputs simultaneously:
1. A per-PA action recommendation — specific, actionable, and tied to the scheduled procedure date
2. A per-PA outcome prediction — for pending and denied PAs, a structured likelihood assessment with key factors
3. A macro PA intelligence summary — what the practice most needs to know and do today

For each PA, you receive the raw Optum PA status response, the PA's context (patient, procedure, payer, submission date, scheduled procedure date, urgency type), and CMS compliance status.

PRIORITY ASSIGNMENT RULES:
- CRITICAL: Procedure date is within 5 calendar days AND PA is not yet approved. The physician cannot safely schedule or proceed without immediate resolution. Or payer has denied and appeal deadline is within 48 hours.
- URGENT: Procedure date is 6-14 days away AND PA is pending or denied. Or payer has exceeded CMS 7-day standard response window (3 days for urgent PAs) — compliance escalation required.
- ACTION_REQUIRED: PA has been denied but is within the appeal window. Or payer has requested additional clinical information. Or PA approval expires within 14 days.
- MONITOR: PA is pending within normal CMS response window. Or PA is approved with procedure date more than 14 days away.
- APPROVED: PA is approved, procedure date is more than 14 days out, no expiration risk. No action needed beyond confirming scheduling.

CMS PRIOR AUTHORIZATION FINAL RULE (effective January 2026):
- Standard PA requests: Payer must respond within 7 calendar days
- Urgent PA requests: Payer must respond within 72 hours (3 calendar days)
- Payers must provide a specific reason for any denial
- If the response deadline has passed and no response received: this is a CMS compliance violation. Flag the PA as a CMS compliance escalation. Provide the specific step: call the payer's provider relations line and cite the CMS Prior Authorization Final Rule (CMS-0057-F). Document the call for potential CMS complaint filing.
- Do not simply say "contact payer" for CMS violations. Say "File a CMS non-compliance escalation" and explain the specific steps.

OUTCOME PREDICTION RULES (for PENDING and DENIED PAs only):
- HIGH approval likelihood: Procedure is medically necessary with clear clinical indication, payer has a pattern of approving this procedure type, documentation is typically straightforward, no known payer exclusions.
- MEDIUM approval likelihood: Procedure is medically necessary but payer requires extensive documentation, prior conservative treatment documentation, or specific imaging. The outcome depends heavily on what clinical evidence is submitted.
- LOW approval likelihood: Procedure has known payer exclusions or coverage limitations, medical necessity criteria are difficult to meet on paper, or the denial reason suggests the payer has a categorical policy against this procedure for this diagnosis.
- Peer-to-peer review: Recommend when the denial appears to be based on insufficient chart review rather than a categorical policy exclusion. A physician-to-physician conversation often reverses these denials.
- Do not produce a prediction for APPROVED PAs — set prediction to null for those.

PROCEDURE DATE URGENCY:
- Always compute urgency relative to scheduledProcedureDate if available.
- If scheduledProcedureDate is null: note this explicitly and flag as ACTION_REQUIRED — the practice cannot schedule without knowing the procedure date.
- If procedure is within 5 days of an unresolved PA: always CRITICAL regardless of other factors.

DOCUMENTATION RECOMMENDATIONS:
- Be specific. Do not say "submit clinical documentation."
- Say exactly what clinical records: "Operative report from prior surgery," "Imaging results with radiologist interpretation," "Letter of medical necessity citing [specific ICD-10 code] and [specific clinical criteria]."
- Tie documentation recommendations to the specific denial reason or payer's known criteria.

MACRO SUMMARY RULES:
- topThreeActions must name specific PA authorization numbers.
- cmsComplianceSummary must be non-null if any CMS violations exist. Name the payers who are in violation.
- insight must identify something non-obvious — a pattern across multiple PAs, a systemic payer behavior, or an optimization opportunity that is not visible by looking at individual PAs.
- practiceHealthSummary must be honest. Do not produce generic positive framing if the PA situation is poor.

Your output must be valid JSON matching the ClaudePAAnalysis interface exactly. Do not include markdown, prose, or explanation outside the JSON structure. Do not include JSON fences or backticks. Return only the JSON object.`

interface ClaudePAInput {
  paRequests: Array<{
    paId: string
    context: {
      patientName: string
      procedureCode: string
      procedureDescription: string
      payerName: string
      urgencyType: string
      submittedDate: string
      daysSubmitted: number
      scheduledProcedureDate: string | null
      daysUntilProcedure: number | null
      cmsResponseDeadline: string
      isCMSWindowViolated: boolean
      daysCMSOverdue: number | null
      paContext: string
    }
    statusResponse: PAStatusResponse
  }>
  practiceContext: {
    totalPAsInFeed: number
    criticalCount: number
    cmsViolationCount: number
    totalPending: number
    totalApproved: number
    totalDenied: number
  }
}

export function buildClaudeInput(
  paItems: Array<{ pa: SyntheticPA; statusResponse: PAStatusResponse }>
): ClaudePAInput {
  const criticalCount = paItems.filter(
    (item) =>
      item.pa.daysUntilProcedure !== null &&
      item.pa.daysUntilProcedure <= 5 &&
      item.pa.scenario !== 'APPROVED_READY_TO_SCHEDULE'
  ).length

  const cmsViolationCount = paItems.filter(
    (item) => item.pa.isCMSWindowViolated
  ).length

  const totalPending = paItems.filter((item) =>
    item.pa.scenario.startsWith('PENDING')
  ).length

  const totalApproved = paItems.filter((item) =>
    item.pa.scenario.startsWith('APPROVED')
  ).length

  const totalDenied = paItems.filter((item) =>
    item.pa.scenario.startsWith('DENIED')
  ).length

  return {
    paRequests: paItems.map((item) => ({
      paId: item.pa.id,
      context: {
        patientName: `${item.pa.patientFirstName} ${item.pa.patientLastName}`,
        procedureCode: item.pa.procedureCode,
        procedureDescription: item.pa.procedureDescription,
        payerName: item.pa.payerName,
        urgencyType: item.pa.urgencyType,
        submittedDate: item.pa.submittedDate,
        daysSubmitted: item.pa.daysSubmitted,
        scheduledProcedureDate: item.pa.scheduledProcedureDate,
        daysUntilProcedure: item.pa.daysUntilProcedure,
        cmsResponseDeadline: item.pa.cmsResponseDeadline,
        isCMSWindowViolated: item.pa.isCMSWindowViolated,
        daysCMSOverdue: item.pa.daysCMSOverdue,
        paContext: item.pa.paContext,
      },
      statusResponse: item.statusResponse,
    })),
    practiceContext: {
      totalPAsInFeed: paItems.length,
      criticalCount,
      cmsViolationCount,
      totalPending,
      totalApproved,
      totalDenied,
    },
  }
}

export async function analyzeWithClaude(
  input: ClaudePAInput
): Promise<ClaudePAAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error: ${response.status} ${errorText}`)
  }

  const result = (await response.json()) as {
    content: Array<{ type: string; text: string }>
  }

  const textBlock = result.content.find((c) => c.type === 'text')
  if (!textBlock) {
    throw new Error('Claude API returned no text content')
  }

  const analysis = JSON.parse(textBlock.text) as ClaudePAAnalysis
  return analysis
}
