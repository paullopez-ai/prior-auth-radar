"use client"

import { Card, CardContent } from '@/components/ui/card'
import type { PAStatusResponse } from '@/types/optum.types'

interface PARawResponseTabProps {
  statusResponse: PAStatusResponse
}

export function PARawResponseTab({ statusResponse }: PARawResponseTabProps) {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
          {JSON.stringify(statusResponse, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}
