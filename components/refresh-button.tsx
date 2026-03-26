"use client"

import { Button } from '@/components/ui/button'
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  onClick: () => void
  isLoading: boolean
}

export function RefreshButton({ onClick, isLoading }: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className="gap-1.5"
    >
      <HugeiconsIcon
        icon={RefreshIcon}
        className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
      />
      <span className="text-xs">Refresh PA Intelligence</span>
    </Button>
  )
}
