"use client"

import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface SandboxModeBannerProps {
  isSandbox: boolean
}

export function SandboxModeBanner({ isSandbox }: SandboxModeBannerProps) {
  if (!isSandbox) return null

  return (
    <div className="w-full bg-brand-secondary/15 border-b border-brand-secondary/30 px-4 py-2 text-center text-sm text-brand-secondary">
      <HugeiconsIcon icon={AlertCircleIcon} className="inline h-4 w-4 mr-1.5 -mt-0.5" />
      <span className="font-semibold">Sandbox Mode</span> — Connected to Optum sandbox API. Data may be sparse or synthetic.
    </div>
  )
}
