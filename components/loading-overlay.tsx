"use client"

import { motion, AnimatePresence } from 'framer-motion'

interface LoadingOverlayProps {
  isLoading: boolean
  phase: 'pa-status' | 'claude' | null
}

export function LoadingOverlay({ isLoading, phase }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="text-center space-y-4">
            <div className="h-8 w-8 mx-auto border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-mono">
              {phase === 'pa-status' && 'Checking 10 PAs in parallel...'}
              {phase === 'claude' && 'Analyzing PA intelligence...'}
              {!phase && 'Loading...'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
