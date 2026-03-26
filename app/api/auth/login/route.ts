import { NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username: string; password: string }
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const valid = await validateCredentials(username, password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await createSession(username)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
