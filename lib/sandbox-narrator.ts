import type { SandboxLogEntry, SandboxNarrative } from '@/types/sandbox.types'

export function buildSandboxLogger() {
  const start = Date.now()
  const logs: SandboxLogEntry[] = []
  const startedAt = new Date().toISOString()

  function log(step: string, level: SandboxLogEntry['level'], message: string) {
    logs.push({ offsetMs: Date.now() - start, step, level, message })
  }

  function finish(): SandboxNarrative {
    return {
      logs,
      startedAt,
      completedAt: new Date().toISOString(),
      totalMs: Date.now() - start,
    }
  }

  return { log, finish }
}
