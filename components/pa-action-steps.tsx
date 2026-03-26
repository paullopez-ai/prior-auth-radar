"use client"

interface PAActionStepsProps {
  steps: Array<{
    stepNumber: number
    step: string
    estimatedTime: string
  }>
}

export function PAActionSteps({ steps }: PAActionStepsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold">Action Steps</h4>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.stepNumber} className="flex gap-3 items-start">
            <span className="font-mono text-xs font-bold text-brand-secondary bg-brand-secondary/10 h-5 w-5 flex items-center justify-center shrink-0">
              {step.stepNumber}
            </span>
            <div className="flex-1">
              <p className="text-sm">{step.step}</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{step.estimatedTime}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
