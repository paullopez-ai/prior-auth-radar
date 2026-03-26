"use client"

import { useState, useEffect, useCallback } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ModeToggle } from '@/components/mode-toggle'
import { MockModeBanner } from '@/components/mock-mode-banner'
import { SandboxModeBanner } from '@/components/sandbox-mode-banner'
import { SandboxDisclosure } from '@/components/sandbox-disclosure'
import { PAStatsBar } from '@/components/pa-stats-bar'
import { PASummaryPanel } from '@/components/pa-summary-panel'
import { PAFeedControls } from '@/components/pa-feed-controls'
import { PAFeedTable } from '@/components/pa-feed-table'
import { TimingBadges } from '@/components/timing-badges'
import { RefreshButton } from '@/components/refresh-button'
import { LoadingOverlay } from '@/components/loading-overlay'
import { SandboxDevConsole } from '@/components/sandbox-dev-console'
import { loadMockFeedData } from '@/lib/mock/mock-loader'
import { sortPAItems, filterPAItems, getUniquePayers } from '@/lib/pa-utils'
import type { PAFeedResult, PAStatusResult } from '@/types/optum.types'
import type { ClaudePAAnalysis } from '@/types/claude.types'
import type { SandboxNarrative } from '@/types/sandbox.types'
import type { PAPriority, PAUrgencyType, PASortField, SortDirection } from '@/types/pa.types'

type AppMode = 'mock' | 'sandbox'

function getInitialMode(): AppMode {
  const env = process.env.NEXT_PUBLIC_APP_ENV
  if (env === 'sandbox') return 'sandbox'
  return 'mock'
}

type FeedStatus = 'idle' | 'refreshing' | 'success' | 'partial_error' | 'total_error'

export default function DashboardPage() {
  const [mode, setMode] = useState<AppMode>(getInitialMode)
  const [feedStatus, setFeedStatus] = useState<FeedStatus>('idle')
  const [paItems, setPAItems] = useState<PAStatusResult[]>([])
  const [paAnalysis, setPAAnalysis] = useState<ClaudePAAnalysis | null>(null)
  const [timing, setTiming] = useState<PAFeedResult['timing'] | null>(null)

  const isMock = mode === 'mock'
  const isSandbox = mode === 'sandbox'

  // Filters and sorting
  const [sortField, setSortField] = useState<PASortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [priorityFilter, setPriorityFilter] = useState<PAPriority | 'ALL'>('ALL')
  const [payerFilter, setPayerFilter] = useState<string | 'ALL'>('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState<PAUrgencyType | 'ALL'>('ALL')

  // Expansion state
  const [expandedPAs, setExpandedPAs] = useState<Record<string, boolean>>({})
  const [activeTabs, setActiveTabs] = useState<Record<string, 'action' | 'prediction' | 'detail' | 'raw'>>({})

  // Loading
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'pa-status' | 'claude' | null>(null)

  // Sandbox narrative
  const [sandboxNarrative, setSandboxNarrative] = useState<SandboxNarrative | null>(null)

  const handleModeChange = useCallback((newMode: AppMode) => {
    setMode(newMode)
    // Reset state on mode change
    setPAItems([])
    setPAAnalysis(null)
    setTiming(null)
    setFeedStatus('idle')
    setSandboxNarrative(null)
  }, [])

  // Load mock data on mount or when switching to mock mode
  useEffect(() => {
    if (isMock) {
      const data = loadMockFeedData()
      setPAItems(data.paItems)
      setPAAnalysis(data.paAnalysis)
      setTiming(data.timing)
      setFeedStatus('success')
    }
  }, [isMock])

  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    setLoadingPhase('pa-status')
    setFeedStatus('refreshing')

    try {
      const res = await fetch('/api/optum/pa-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      setLoadingPhase('claude')
      const data = (await res.json()) as PAFeedResult & { sandboxNarrative?: SandboxNarrative }
      setPAItems(data.paItems)
      setPAAnalysis(data.paAnalysis)
      setTiming(data.timing)
      if (data.sandboxNarrative) setSandboxNarrative(data.sandboxNarrative)
      setFeedStatus(data.errorCount > 0 ? 'partial_error' : 'success')
    } catch {
      setFeedStatus('total_error')
    } finally {
      setIsLoading(false)
      setLoadingPhase(null)
    }
  }, [mode])

  // Apply sorting and filtering
  const filteredItems = filterPAItems(paItems, {
    priority: priorityFilter,
    scenario: 'ALL',
    payerName: payerFilter,
    urgencyType: urgencyFilter,
  })
  const sortedItems = sortPAItems(filteredItems, sortField, sortDirection)
  const payers = getUniquePayers(paItems)

  function toggleExpand(id: string) {
    setExpandedPAs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function changeTab(id: string, tab: 'action' | 'prediction' | 'detail' | 'raw') {
    setActiveTabs((prev) => ({ ...prev, [id]: tab }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LoadingOverlay isLoading={isLoading} phase={loadingPhase} />

      {/* Banners */}
      <MockModeBanner isMock={isMock} />
      <SandboxModeBanner isSandbox={isSandbox} />

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Prior Auth Radar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered PA management — {paItems.length} authorizations at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimingBadges timing={timing} />
            <RefreshButton onClick={handleRefresh} isLoading={isLoading} />
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats bar */}
          <PAStatsBar summary={paAnalysis?.paSummary ?? null} />

          {/* Macro summary */}
          <PASummaryPanel summary={paAnalysis?.paSummary ?? null} />

          {/* Feed controls */}
          <div className="flex items-center justify-between">
            <PAFeedControls
              sortField={sortField}
              sortDirection={sortDirection}
              priorityFilter={priorityFilter}
              payerFilter={payerFilter}
              urgencyFilter={urgencyFilter}
              payers={payers}
              onSortFieldChange={setSortField}
              onSortDirectionChange={setSortDirection}
              onPriorityFilterChange={setPriorityFilter}
              onPayerFilterChange={setPayerFilter}
              onUrgencyFilterChange={setUrgencyFilter}
            />
            <span className="text-xs text-muted-foreground font-mono">
              {sortedItems.length} of {paItems.length} PAs
            </span>
          </div>

          {/* PA Feed Table */}
          <div className="border border-border">
            <PAFeedTable
              items={sortedItems}
              expandedPAs={expandedPAs}
              activeTabs={activeTabs}
              onToggleExpand={toggleExpand}
              onTabChange={changeTab}
            />
          </div>

          {feedStatus === 'total_error' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-center text-sm text-destructive">
              Failed to load PA data. Please try again.
            </div>
          )}
        </div>
      </main>

      {/* Sandbox dev console */}
      {isSandbox && sandboxNarrative && (
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <SandboxDevConsole narrative={sandboxNarrative} />
          </div>
        </div>
      )}

      {/* Footer */}
      <SandboxDisclosure />
    </div>
  )
}
