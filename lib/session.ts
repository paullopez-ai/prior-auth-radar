import { cookies } from 'next/headers'

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'pa_radar_session'
const EXPIRY_HOURS = Number(process.env.SESSION_EXPIRY_HOURS ?? 24)

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

async function sign(payload: string): Promise<string> {
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
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${payload}.${sigHex}`
}

async function verify(token: string): Promise<string | null> {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const expected = await sign(payload)
  if (expected.length !== token.length) return null

  // Constant-time comparison
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return mismatch === 0 ? payload : null
}

export async function createSession(username: string): Promise<void> {
  const expiresAt = Date.now() + EXPIRY_HOURS * 60 * 60 * 1000
  const payload = JSON.stringify({ username, expiresAt })
  const token = await sign(payload)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: EXPIRY_HOURS * 60 * 60,
  })
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verify(token)
  if (!payload) return null

  try {
    const data = JSON.parse(payload) as { username: string; expiresAt: number }
    if (Date.now() > data.expiresAt) return null
    return { username: data.username }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
