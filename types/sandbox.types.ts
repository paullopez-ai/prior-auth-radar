export type SandboxLogLevel = 'success' | 'error' | 'warn' | 'info' | 'explain'

export interface SandboxLogEntry {
  offsetMs: number
  step: string
  level: SandboxLogLevel
  message: string
}

export interface SandboxNarrative {
  logs: SandboxLogEntry[]
  startedAt: string
  completedAt: string
  totalMs: number
}
