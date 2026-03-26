"use client"

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PARow } from '@/components/pa-row'
import type { PAStatusResult } from '@/types/optum.types'

interface PAFeedTableProps {
  items: PAStatusResult[]
  expandedPAs: Record<string, boolean>
  activeTabs: Record<string, 'action' | 'prediction' | 'detail' | 'raw'>
  onToggleExpand: (id: string) => void
  onTabChange: (id: string, tab: 'action' | 'prediction' | 'detail' | 'raw') => void
}

export function PAFeedTable({
  items,
  expandedPAs,
  activeTabs,
  onToggleExpand,
  onTabChange,
}: PAFeedTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] text-xs">Priority</TableHead>
          <TableHead className="text-xs">Patient</TableHead>
          <TableHead className="text-xs">Procedure</TableHead>
          <TableHead className="text-xs">Payer</TableHead>
          <TableHead className="w-[80px] text-xs text-center">Status</TableHead>
          <TableHead className="w-[80px] text-xs text-center">CMS</TableHead>
          <TableHead className="w-[70px] text-xs text-center">Surgery</TableHead>
          <TableHead className="w-[40px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <PARow
            key={item.pa.id}
            item={item}
            isExpanded={expandedPAs[item.pa.id] ?? false}
            activeTab={activeTabs[item.pa.id] ?? 'action'}
            onToggleExpand={() => onToggleExpand(item.pa.id)}
            onTabChange={(tab) => onTabChange(item.pa.id, tab)}
          />
        ))}
      </TableBody>
    </Table>
  )
}
