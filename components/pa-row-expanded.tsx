"use client"

import { TableCell, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PAActionTab } from '@/components/pa-action-tab'
import { PAPredictionTab } from '@/components/pa-prediction-tab'
import { PADetailTab } from '@/components/pa-detail-tab'
import { PARawResponseTab } from '@/components/pa-raw-response-tab'
import { motion } from 'framer-motion'
import type { PAStatusResult } from '@/types/optum.types'

interface PARowExpandedProps {
  item: PAStatusResult
  activeTab: 'action' | 'prediction' | 'detail' | 'raw'
  onTabChange: (tab: 'action' | 'prediction' | 'detail' | 'raw') => void
}

export function PARowExpanded({ item, activeTab, onTabChange }: PARowExpandedProps) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-4"
        >
          <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as typeof activeTab)}>
            <TabsList className="mb-3">
              <TabsTrigger value="action" className="text-xs data-[state=active]:text-brand-secondary data-[state=active]:border-brand-secondary">
                Action
              </TabsTrigger>
              <TabsTrigger value="prediction" className="text-xs data-[state=active]:text-brand-secondary data-[state=active]:border-brand-secondary">
                Prediction
              </TabsTrigger>
              <TabsTrigger value="detail" className="text-xs data-[state=active]:text-primary data-[state=active]:border-primary">
                Detail
              </TabsTrigger>
              <TabsTrigger value="raw" className="text-xs data-[state=active]:text-primary data-[state=active]:border-primary">
                Raw
              </TabsTrigger>
            </TabsList>
            <TabsContent value="action">
              <PAActionTab action={item.paAction} pa={item.pa} />
            </TabsContent>
            <TabsContent value="prediction">
              <PAPredictionTab
                prediction={item.paOutcomePrediction}
                pa={item.pa}
                statusResponse={item.statusResponse}
              />
            </TabsContent>
            <TabsContent value="detail">
              <PADetailTab item={item} />
            </TabsContent>
            <TabsContent value="raw">
              <PARawResponseTab statusResponse={item.statusResponse} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </TableCell>
    </TableRow>
  )
}
