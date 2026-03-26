import { PA_ITEMS } from '@/lib/pa-items'
import { MOCK_PA_STATUS_FIXTURES } from '@/lib/mock/pa-status-fixtures'
import { MOCK_CLAUDE_ANALYSIS } from '@/lib/mock/claude-fixtures'
import type { PAFeedResult, PAStatusResult } from '@/types/optum.types'

export function loadMockFeedData(): PAFeedResult {
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

  return {
    paItems,
    paAnalysis: MOCK_CLAUDE_ANALYSIS,
    timing: {
      parallelStatusMs: 280,
      claudeMs: 2200,
      totalMs: 2480,
    },
    mode: 'mock',
    successCount: paItems.length,
    errorCount: 0,
  }
}
