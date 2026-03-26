"use client"

import { Button } from '@/components/ui/button'
import { AlertCircleIcon, TestTube02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface ModeToggleProps {
  mode: 'mock' | 'sandbox'
  onModeChange: (mode: 'mock' | 'sandbox') => void
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const isMock = mode === 'mock'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onModeChange(isMock ? 'sandbox' : 'mock')}
      className="gap-1.5 text-xs"
    >
      <HugeiconsIcon
        icon={isMock ? AlertCircleIcon : TestTube02Icon}
        className="h-3.5 w-3.5"
      />
      {isMock ? 'Mock' : 'Sandbox'}
    </Button>
  )
}
