"use client"

import * as React from "react"
import type { SandboxNarrative } from "@/types/sandbox.types"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HugeiconsIcon } from "@hugeicons/react"
import { TestTube02Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const levelColors: Record<string, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warn: "text-amber-400",
  info: "text-purple-400",
  explain: "text-gray-500",
}

const PROVES = [
  "OAuth client-credentials flow completes against Optum token endpoint",
  "GraphQL PA status query reaches Optum sandbox and returns structured data",
  "Parallel Promise.all() execution for 10 PA inquiries completes end-to-end",
  "Claude API key is valid and model responds to PA analysis prompts",
  "Full pipeline renders: auth → parallel PA status → Claude analysis → dashboard",
]

const LIMITATIONS = [
  "PA status data may be sparse or null — authorization numbers are synthetic",
  "CMS compliance fields may be entirely absent in sandbox responses",
  "PII fields (name, DOB) are masked or synthetic",
  "Claude predictions will reflect sandbox data quality, not real-world accuracy",
]

export function SandboxDevConsole({
  narrative,
}: {
  narrative: SandboxNarrative
}) {
  const [open, setOpen] = React.useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border border-purple-400/20 bg-gray-950 overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-purple-300 hover:bg-gray-900 transition-colors cursor-pointer">
          <span className="flex items-center gap-2">
            <HugeiconsIcon
              icon={TestTube02Icon}
              className="h-4 w-4 text-purple-400"
            />
            Sandbox API Diagnostics
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn(
              "h-4 w-4 text-purple-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-purple-400/10 bg-gray-950 px-4 py-3 space-y-4">
            {/* Log entries */}
            <ScrollArea className="h-48">
              <div className="font-mono text-xs space-y-1">
                {narrative.logs.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-600 shrink-0 w-16 text-right tabular-nums">
                      +{entry.offsetMs}ms
                    </span>
                    <span
                      className={cn(
                        "shrink-0 w-14",
                        levelColors[entry.level] ?? "text-gray-400"
                      )}
                    >
                      [{entry.level}]
                    </span>
                    <span className="text-gray-200">{entry.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Narrative sections */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-300 mb-1.5">
                  What sandbox proves
                </h4>
                <ul className="space-y-1 text-gray-400">
                  {PROVES.map((item, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-green-500 shrink-0">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-1.5">
                  Known sandbox limitations
                </h4>
                <ul className="space-y-1 text-gray-400">
                  {LIMITATIONS.map((item, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-amber-400 shrink-0">~</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Timing footer */}
            <div className="text-xs text-gray-500 text-right tabular-nums">
              Completed in {narrative.totalMs}ms
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
