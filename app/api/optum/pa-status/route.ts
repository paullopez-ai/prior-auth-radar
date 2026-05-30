import { NextRequest, NextResponse } from 'next/server'

// This route is now a thin proxy to the Python FastAPI + LangGraph backend.
// The orchestration that used to live here (Optum status fetch + single Claude
// call) has moved server-side into the backend's six-node LangGraph workflow
// running on Amazon Bedrock. The request and response shapes are unchanged, so
// the frontend requires no state-management changes.
//
// Note on Vercel: in the Vercel product demo the dashboard runs in mock mode
// and loads fixtures client-side via loadMockFeedData(), so this route is never
// invoked there. In Docker Compose / AWS, NEXT_PUBLIC_FORCE_BACKEND routes every
// Refresh through this proxy so LangSmith traces are always produced.

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ mode: 'mock' }))

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000'

  try {
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Backend unreachable at ${backendUrl}: ${message}` },
      { status: 502 }
    )
  }
}
