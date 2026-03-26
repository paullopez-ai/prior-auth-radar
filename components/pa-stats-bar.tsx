"use client"

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ClaudePASummary } from '@/types/claude.types'

interface PAStatsBarProps {
  summary: ClaudePASummary | null
}

const STAT_CARDS = [
  { key: 'criticalCount', label: 'CRITICAL', className: 'border-destructive/40 text-destructive', dot: true },
  { key: 'urgentCount', label: 'URGENT', className: 'border-brand/40 text-brand', dot: false },
  { key: 'actionRequiredCount', label: 'ACTION', className: 'border-brand/30 text-brand', dot: false },
  { key: 'monitorCount', label: 'MONITOR', className: 'border-border text-muted-foreground', dot: false },
  { key: 'approvedCount', label: 'APPROVED', className: 'border-green-500/40 text-green-700 dark:text-green-400', dot: false },
] as const

export function PAStatsBar({ summary }: PAStatsBarProps) {
  if (!summary) return null

  return (
    <div className="grid grid-cols-5 gap-3">
      {STAT_CARDS.map((card, i) => {
        const count = summary[card.key]
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={cn('border', card.className)}>
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {card.dot && count > 0 && (
                    <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  )}
                  <span className="text-2xl font-mono font-bold">{count}</span>
                </div>
                <p className="text-[10px] font-mono mt-1 opacity-80">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
