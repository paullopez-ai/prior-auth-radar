import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'pa_radar_session'

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false

  const payload = token.slice(0, lastDot)
  const key = await crypto.subtle.importKey(
    'raw',
    getSecret() as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  const expectedSig = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const actualSig = token.slice(lastDot + 1)

  if (expectedSig.length !== actualSig.length) return false
  let mismatch = 0
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ actualSig.charCodeAt(i)
  }
  if (mismatch !== 0) return false

  // Check expiry
  try {
    const data = JSON.parse(payload) as { expiresAt: number }
    return Date.now() <= data.expiresAt
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth in mock mode
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'mock'
  if (appEnv === 'mock') return NextResponse.next()

  // Public routes — no auth required
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
