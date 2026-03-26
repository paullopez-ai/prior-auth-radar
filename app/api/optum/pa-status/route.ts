import { NextRequest, NextResponse } from 'next/server'
import { PA_ITEMS } from '@/lib/pa-items'
import { getOptumBearerToken } from '@/lib/optum-auth'
import { fetchPAStatus } from '@/lib/optum-pa-status'
import { buildClaudeInput, analyzeWithClaude } from '@/lib/claude-pa-analyzer'
import { buildSandboxLogger } from '@/lib/sandbox-narrator'
import type { PAStatusResult, PAFeedResult, PAStatusResponse } from '@/types/optum.types'
import type { ClaudePAAnalysis } from '@/types/claude.types'

const MOCK_DELAYS = {
  parallelBatch: 280,
  claude: 2200,
}

export async function POST(request: NextRequest) {
  const totalStart = Date.now()

  let mode: 'mock' | 'sandbox' = 'mock'
  try {
    const body = await request.json()
    if (body.mode === 'sandbox') mode = 'sandbox'
  } catch {
    // Default to mock if no body
  }

  if (mode === 'mock') {
    return handleMockMode(totalStart)
  }

  return handleLiveMode(totalStart)
}

async function handleMockMode(totalStart: number): Promise<NextResponse<PAFeedResult>> {
  // Dynamic import to avoid bundling fixtures in production
  const { MOCK_PA_STATUS_FIXTURES } = await import('@/lib/mock/pa-status-fixtures')
  const { MOCK_CLAUDE_ANALYSIS } = await import('@/lib/mock/claude-fixtures')

  // Simulate parallel batch delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAYS.parallelBatch))
  const parallelEnd = Date.now()

  // Simulate Claude delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAYS.claude))
  const claudeEnd = Date.now()

  const paItems: PAStatusResult[] = PA_ITEMS.map((pa) => {
    const statusResponse = MOCK_PA_STATUS_FIXTURES[pa.mockPAScenario]
    const paAction = MOCK_CLAUDE_ANALYSIS.perPAActions[pa.id]
    const paOutcomePrediction = MOCK_CLAUDE_ANALYSIS.perPAPredictions[pa.id] ?? null

    return {
      pa,
      statusResponse,
      paAction,
      paOutcomePrediction,
      timingMs: Math.floor(Math.random() * 80) + 120,
      error: null,
    }
  })

  const result: PAFeedResult = {
    paItems,
    paAnalysis: MOCK_CLAUDE_ANALYSIS,
    timing: {
      parallelStatusMs: parallelEnd - totalStart,
      claudeMs: claudeEnd - parallelEnd,
      totalMs: Date.now() - totalStart,
    },
    mode: 'mock',
    successCount: paItems.length,
    errorCount: 0,
  }

  return NextResponse.json(result)
}

async function handleLiveMode(totalStart: number): Promise<NextResponse> {
  const sbx = buildSandboxLogger()

  try {
    // Get Bearer token
    sbx?.log('auth', 'info', 'Requesting Optum Bearer token via OAuth client-credentials')
    const token = await getOptumBearerToken()
    sbx?.log('auth', 'success', 'Bearer token obtained')

    // Parallel PA status queries
    sbx?.log('pa-status', 'info', `Querying ${PA_ITEMS.length} PAs in parallel via Promise.all()`)
    const parallelStart = Date.now()

    const statusResults = await Promise.all(
      PA_ITEMS.map(async (pa) => {
        const itemStart = Date.now()
        try {
          const statusResponse = await fetchPAStatus(
            pa.authorizationNumber,
            pa.tradingPartnerServiceId,
            token
          )
          sbx?.log('pa-status', 'success', `PA ${pa.id} → ${statusResponse.status.statusCode} (${Date.now() - itemStart}ms)`)
          return {
            pa,
            statusResponse,
            timingMs: Date.now() - itemStart,
            error: null as string | null,
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error'
          sbx?.log('pa-status', 'error', `PA ${pa.id} failed: ${errorMessage}`)
          return {
            pa,
            statusResponse: null as PAStatusResponse | null,
            timingMs: Date.now() - itemStart,
            error: errorMessage,
          }
        }
      })
    )

    const parallelEnd = Date.now()
    sbx?.log('pa-status', 'info', `Parallel batch complete — ${parallelEnd - parallelStart}ms`)

    // Separate successes and failures
    const successfulItems = statusResults.filter(
      (r): r is typeof r & { statusResponse: PAStatusResponse } =>
        r.statusResponse !== null
    )
    const failedItems = statusResults.filter((r) => r.statusResponse === null)

    sbx?.log('pa-status', successfulItems.length > 0 ? 'success' : 'warn',
      `${successfulItems.length} succeeded, ${failedItems.length} failed`)

    // Call Claude with successful results
    let analysis: ClaudePAAnalysis | null = null
    const claudeStart = Date.now()

    if (successfulItems.length > 0) {
      try {
        sbx?.log('claude', 'info', 'Sending PA data to Claude for analysis')
        const claudeInput = buildClaudeInput(
          successfulItems.map((r) => ({
            pa: r.pa,
            statusResponse: r.statusResponse,
          }))
        )
        analysis = await analyzeWithClaude(claudeInput)
        sbx?.log('claude', 'success', `Claude analysis complete — ${Date.now() - claudeStart}ms`)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Claude analysis failed'
        sbx?.log('claude', 'error', errorMessage)
      }
    } else {
      sbx?.log('claude', 'warn', 'No successful PA responses — skipping Claude analysis')
    }

    const claudeEnd = Date.now()

    // Build fallback analysis if Claude failed
    if (!analysis) {
      sbx?.log('claude', 'explain', 'Using fallback analysis (no AI predictions)')
      analysis = buildFallbackAnalysis()
    }

    // Assemble results
    const paItems: PAStatusResult[] = statusResults.map((r) => {
      if (r.statusResponse && analysis) {
        return {
          pa: r.pa,
          statusResponse: r.statusResponse,
          paAction: analysis.perPAActions[r.pa.id] ?? buildFallbackAction(),
          paOutcomePrediction: analysis.perPAPredictions[r.pa.id] ?? null,
          timingMs: r.timingMs,
          error: r.error,
        }
      }

      return {
        pa: r.pa,
        statusResponse: buildEmptyStatusResponse(r.pa),
        paAction: buildFallbackAction(),
        paOutcomePrediction: null,
        timingMs: r.timingMs,
        error:
          r.error ??
          'Sandbox: No response for this PA ID — use mock mode to see full PA intelligence output.',
      }
    })

    sbx?.log('pipeline', 'success', `Full pipeline complete — ${Date.now() - totalStart}ms total`)

    const result: PAFeedResult = {
      paItems,
      paAnalysis: analysis,
      timing: {
        parallelStatusMs: parallelEnd - parallelStart,
        claudeMs: claudeEnd - claudeStart,
        totalMs: Date.now() - totalStart,
      },
      mode: 'sandbox',
      successCount: successfulItems.length,
      errorCount: failedItems.length,
    }

    return NextResponse.json({
      ...result,
      ...(sbx ? { sandboxNarrative: sbx.finish() } : {}),
    })
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error'
    sbx?.log('route', 'error', errorMessage)
    return NextResponse.json(
      {
        error: errorMessage,
        ...(sbx ? { sandboxNarrative: sbx.finish() } : {}),
      },
      { status: 500 }
    )
  }
}

function buildFallbackAction() {
  return {
    priority: 'MONITOR' as const,
    priorityReason: 'AI analysis unavailable',
    immediateAction: null,
    actionDeadline: null,
    actionSteps: [],
    cmsComplianceAction: null,
    statusInterpretation: 'AI analysis unavailable — showing raw PA status.',
    riskAssessment: {
      procedureDateRisk: false,
      cmsViolationRisk: false,
      denialRisk: false,
      appealDeadlineRisk: false,
      riskSummary: null,
    },
    recommendedDocumentation: [],
    contactPayer: false,
    contactPayerReason: null,
  }
}

function buildFallbackAnalysis(): ClaudePAAnalysis {
  const perPAActions: Record<string, ReturnType<typeof buildFallbackAction>> = {}
  const perPAPredictions: Record<string, null> = {}
  for (const pa of PA_ITEMS) {
    perPAActions[pa.id] = buildFallbackAction()
    perPAPredictions[pa.id] = null
  }

  return {
    perPAActions,
    perPAPredictions,
    paSummary: {
      criticalCount: 0,
      urgentCount: 0,
      actionRequiredCount: 0,
      monitorCount: 0,
      approvedCount: 0,
      totalPAsInFeed: PA_ITEMS.length,
      cmsViolationCount: 0,
      proceduresAtRiskCount: 0,
      topThreeActions: [],
      practiceHealthSummary:
        'PA intelligence summary unavailable — showing raw data.',
      cmsComplianceSummary: null,
      flaggedForImmediateAttention: [],
      insight: 'AI analysis unavailable.',
    },
  }
}

function buildEmptyStatusResponse(pa: (typeof PA_ITEMS)[number]): PAStatusResponse {
  return {
    authorizationNumber: pa.authorizationNumber,
    tradingPartnerServiceId: pa.tradingPartnerServiceId,
    status: {
      statusCode: 'UNKNOWN',
      statusDescription: 'Status unavailable',
      statusCategory: 'Unknown',
      effectiveDate: null,
      expirationDate: null,
    },
    requestedProcedure: {
      procedureCode: pa.procedureCode,
      procedureDescription: pa.procedureDescription,
      serviceTypeCode: null,
      quantity: null,
      unitType: null,
    },
    requestedProvider: {
      npi: pa.requestingProviderNPI,
      organizationName: pa.requestingProviderName,
      firstName: null,
      lastName: null,
    },
    requestingProvider: {
      npi: pa.requestingProviderNPI,
      organizationName: pa.requestingProviderName,
    },
    member: {
      memberId: pa.memberId,
      firstName: pa.patientFirstName,
      lastName: pa.patientLastName,
      dateOfBirth: pa.dateOfBirth,
      groupNumber: null,
    },
    payer: {
      name: pa.payerName,
      payerId: pa.tradingPartnerServiceId,
    },
    submittedDate: pa.submittedDate,
    scheduledProcedureDate: pa.scheduledProcedureDate,
    urgencyType: pa.urgencyType,
    denialInfo: {
      isDenied: false,
      denialReason: null,
      denialCode: null,
      appealDeadline: null,
      peerToPeerAvailable: null,
    },
    additionalInfoRequired: {
      isRequired: false,
      infoType: null,
      description: null,
      dueDate: null,
    },
    cmsComplianceStatus: null,
  }
}
