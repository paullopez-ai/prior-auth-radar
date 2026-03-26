"use client"

import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface MockModeBannerProps {
  isMock: boolean
}

export function MockModeBanner({ isMock }: MockModeBannerProps) {
  if (!isMock) return null

  return (
    <div className="w-full bg-brand/15 border-b border-brand/30 px-4 py-2 text-center text-sm text-brand">
      <HugeiconsIcon icon={AlertCircleIcon} className="inline h-4 w-4 mr-1.5 -mt-0.5" />
      <span className="font-semibold">Mock Mode</span> — Using synthetic data. No live API calls.
      Switch to Sandbox to connect to live Optum APIs.
    </div>
  )
}
