"use client"

import { PARowCollapsed } from '@/components/pa-row-collapsed'
import { PARowExpanded } from '@/components/pa-row-expanded'
import type { PAStatusResult } from '@/types/optum.types'

interface PARowProps {
  item: PAStatusResult
  isExpanded: boolean
  activeTab: 'action' | 'prediction' | 'detail' | 'raw'
  onToggleExpand: () => void
  onTabChange: (tab: 'action' | 'prediction' | 'detail' | 'raw') => void
}

export function PARow({ item, isExpanded, activeTab, onToggleExpand, onTabChange }: PARowProps) {
  if (item.error && !item.statusResponse) {
    return (
      <PARowCollapsed item={item} onToggleExpand={onToggleExpand} isExpanded={false} />
    )
  }

  return (
    <>
      <PARowCollapsed item={item} onToggleExpand={onToggleExpand} isExpanded={isExpanded} />
      {isExpanded && (
        <PARowExpanded
          item={item}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </>
  )
}
